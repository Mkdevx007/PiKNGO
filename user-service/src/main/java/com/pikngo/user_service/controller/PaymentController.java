package com.pikngo.user_service.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.pikngo.user_service.dto.ApiResponse;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String keyId;

    @Value("${razorpay.key.secret:rzp_test_secret_placeholder}")
    private String keySecret;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, String>>> createOrder(@RequestBody Map<String, Object> data) {
        try {
            double amount = Double.parseDouble(data.get("amount").toString());
            // Razorpay expects amount in paise (multiply by 100)
            int amountInPaise = (int) (amount * 100);

            // OPTIMIZATION: Check for placeholder keys BEFORE trying to hit the Razorpay network
            if (keyId == null || keyId.equals("rzp_test_placeholder")) {
                log.info("Test Mode detected: Returning mock payment order immediately.");
                Map<String, String> mock = new HashMap<>();
                mock.put("razorpayOrderId", "order_mock_" + UUID.randomUUID().toString().substring(0, 8));
                mock.put("keyId", "rzp_test_placeholder");
                mock.put("amount", String.valueOf(amountInPaise));
                mock.put("status", "MOCK_MODE");
                return ResponseEntity.ok(ApiResponse.success("Mock payment order created (Test Mode)", mock));
            }

            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + UUID.randomUUID().toString().substring(0, 8));

            Order order = razorpayClient.orders.create(orderRequest);

            Map<String, String> response = new HashMap<>();
            response.put("razorpayOrderId", String.valueOf(order.get("id")));
            response.put("keyId", keyId);
            response.put("amount", String.valueOf(amountInPaise));

            log.info("Razorpay order created successfully: {}", String.valueOf(order.get("id")));
            return ResponseEntity.ok(ApiResponse.success("Payment order created", response));

        } catch (Exception e) {
            log.error("Error creating Razorpay order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating Razorpay order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayOrderId = data.get("razorpayOrderId");
            String razorpayPaymentId = data.get("razorpayPaymentId");
            String razorpaySignature = data.get("razorpaySignature");

            if (keyId == null || keyId.equals("rzp_test_placeholder") || razorpayOrderId.startsWith("order_mock_")) {
                // Bypass signature check if using placeholders or mock orders
                log.info("Mock verification successful for order: {}", razorpayOrderId);
                Map<String, Boolean> res = new HashMap<>();
                res.put("success", true);
                return ResponseEntity.ok(ApiResponse.success("Payment verified (Mock Mode)", res));
            }

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            Map<String, Boolean> response = new HashMap<>();
            response.put("success", isValid);

            if (isValid) {
                log.info("Razorpay signature verified successfully for Payment ID: {}", razorpayPaymentId);
                return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
            } else {
                log.warn("Invalid Razorpay signature for Payment ID: {}", razorpayPaymentId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Invalid payment signature", response));
            }

        } catch (Exception e) {
            log.error("Error verifying payment signature: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Error verifying payment: " + e.getMessage()));
        }
    }

}
