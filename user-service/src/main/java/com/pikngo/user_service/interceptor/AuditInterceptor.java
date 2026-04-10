package com.pikngo.user_service.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;

/**
 * Developer 4: Observability & Robustness
 * Interceptor for logging API requests and responses
 * Tracks: method, URI, user, status code, response time
 */
@Component
public class AuditInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AuditInterceptor.class);

    private static final String REQUEST_START_TIME = "requestStartTime";
    private static final String REQUEST_ID = "requestId";

    /**
     * Called before the request is handled
     * Logs incoming request details
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestId = UUID.randomUUID().toString();
        request.setAttribute(REQUEST_ID, requestId);
        request.setAttribute(REQUEST_START_TIME, System.currentTimeMillis());

        String user = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "Anonymous";
        
        log.info("=== INCOMING REQUEST === [RequestID: {}] {} {} | User: {}",
                requestId,
                request.getMethod(),
                request.getRequestURI(),
                user);
        
        if (request.getQueryString() != null) {
            log.debug("Query Params: {}", request.getQueryString());
        }
        
        return true;
    }

    /**
     * Called after the request is handled
     * Logs response details and request duration
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                 Object handler, Exception ex) {
        String requestId = (String) request.getAttribute(REQUEST_ID);
        Object startTimeAttr = request.getAttribute(REQUEST_START_TIME);
        
        if (requestId != null && startTimeAttr != null) {
            long startTime = (long) startTimeAttr;
            long duration = System.currentTimeMillis() - startTime;

            if (ex != null) {
                log.error("=== REQUEST ERROR === [RequestID: {}] {} {} | Status: {} | Duration: {}ms | Exception: {}",
                        requestId,
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus(),
                        duration,
                        ex.getMessage(), ex);
            } else {
                if (response.getStatus() >= 400) {
                    log.warn("=== RESPONSE ERROR === [RequestID: {}] {} {} | Status: {} | Duration: {}ms",
                            requestId,
                            request.getMethod(),
                            request.getRequestURI(),
                            response.getStatus(),
                            duration);
                } else {
                    log.info("=== RESPONSE SUCCESS === [RequestID: {}] {} {} | Status: {} | Duration: {}ms",
                            requestId,
                            request.getMethod(),
                            request.getRequestURI(),
                            response.getStatus(),
                            duration);
                }
            }
        }
    }
}
