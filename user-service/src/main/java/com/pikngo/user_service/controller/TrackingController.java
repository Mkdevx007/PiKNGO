package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.LocationUpdateDTO;
import com.pikngo.user_service.entity.Order;
import com.pikngo.user_service.repository.OrderRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
public class TrackingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final OrderRepository orderRepository;

    public TrackingController(SimpMessagingTemplate messagingTemplate, OrderRepository orderRepository) {
        this.messagingTemplate = messagingTemplate;
        this.orderRepository = orderRepository;
    }

    @MessageMapping("/update-location")
    public void updateLocation(@Payload LocationUpdateDTO locationUpdate) {
        // Broadcast the update to anyone listening to this order's topic
        messagingTemplate.convertAndSend("/topic/order-tracking/" + locationUpdate.getOrderId(), locationUpdate);

        // Optional: Update the last known position in the database
        Optional<Order> orderOpt = orderRepository.findById(locationUpdate.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setRiderLatitude(locationUpdate.getLatitude());
            order.setRiderLongitude(locationUpdate.getLongitude());
            orderRepository.save(order);
        }
    }
}
