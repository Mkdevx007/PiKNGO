package com.pikngo.user_service.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import com.pikngo.user_service.exception.EmailDeliveryException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Developer 4: Observability & Robustness
 * Global Exception Handler for consistent error responses across the application.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle UserAlreadyExistsException - when user tries to register with existing email/phone
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Object> handleUserAlreadyExists(UserAlreadyExistsException ex, WebRequest request) {
        log.warn("UserAlreadyExistsException: {}", ex.getMessage());
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "User Already Exists");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    /**
     * Handle UserNotFoundException - when user is not found by ID or phone number
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFound(UserNotFoundException ex, WebRequest request) {
        log.warn("UserNotFoundException: {}", ex.getMessage());
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "User Not Found");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle InvalidOtpException - when OTP verification fails
     */
    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<Object> handleInvalidOtp(InvalidOtpException ex, WebRequest request) {
        log.warn("InvalidOtpException: {}", ex.getMessage());
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Invalid OTP");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle OtpExpiredException - when OTP has expired
     */
    @ExceptionHandler(OtpExpiredException.class)
    public ResponseEntity<Object> handleOtpExpired(OtpExpiredException ex, WebRequest request) {
        log.warn("OtpExpiredException: {}", ex.getMessage());
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "OTP Expired");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle HttpMessageNotReadableException - when JSON parsing fails
     */
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex, WebRequest request) {
        log.warn("HttpMessageNotReadableException: {}", ex.getMessage());
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", "Malformed JSON request or missing body");
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        log.warn("MethodArgumentNotValidException: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("message", "Invalid request parameters");
        body.put("fieldErrors", errors);
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle EmailDeliveryException - SMTP misconfiguration or provider rejection
     */
    @ExceptionHandler(EmailDeliveryException.class)
    public ResponseEntity<Object> handleEmailDelivery(EmailDeliveryException ex, WebRequest request) {
        log.error("EmailDeliveryException: {}", ex.getMessage(), ex.getCause());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_GATEWAY.value());
        body.put("error", "Email Delivery Failed");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_GATEWAY);
    }

    /**
     * Handle TokenException - when password reset token is invalid or expired
     */
    @ExceptionHandler(TokenException.class)
    public ResponseEntity<Object> handleTokenException(TokenException ex, WebRequest request) {
        log.warn("TokenException: {}", ex.getMessage());
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Invalid Token");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle AccessDeniedException - for @PreAuthorize failures
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex, WebRequest request) {
        log.warn("AccessDeniedException: {}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", "You do not have permission to access this resource");
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    /**
     * Handle JPA Constraint Violation Exceptions
     */
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolation(jakarta.validation.ConstraintViolationException ex, WebRequest request) {
        log.warn("ConstraintViolationException: {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String propertyPath = violation.getPropertyPath().toString();
            errors.put(propertyPath, violation.getMessage());
        });

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("message", "Data validation failed");
        body.put("fieldErrors", errors);
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle all other general exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex, WebRequest request) {
        log.error("Unexpected error occurred (500) at {}: ", request.getDescription(false), ex);
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", "Error: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
