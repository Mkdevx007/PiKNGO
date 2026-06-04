package com.pikngo.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String orderId;
    private String senderId;
    private String senderName;
    private String senderRole; // USER, RIDER, RESTAURANT_OWNER
    private String message;
    private long timestamp;
}
