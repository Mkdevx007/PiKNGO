package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ChatMessageDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/order-chat")
    public void sendChatMessage(@Payload ChatMessageDTO chatMessage) {
        if (chatMessage.getTimestamp() == 0) {
            chatMessage.setTimestamp(System.currentTimeMillis());
        }
        messagingTemplate.convertAndSend("/topic/order-chat/" + chatMessage.getOrderId(), chatMessage);
    }
}
