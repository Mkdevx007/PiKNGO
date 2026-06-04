package com.pikngo.user_service.exception;

/**
 * Thrown when outbound SMTP fails (misconfigured credentials, network, provider rejection).
 */
public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message) {
        super(message);
    }

    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
