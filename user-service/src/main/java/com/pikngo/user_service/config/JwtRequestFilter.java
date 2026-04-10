package com.pikngo.user_service.config;

import com.pikngo.user_service.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtRequestFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        if (jwt != null) {
            try {
                username = jwtUtils.getUsernameFromToken(jwt);
                logger.debug("Extracted username from token: " + username);
            } catch (Exception e) {
                logger.error("Unable to get JWT Token or JWT Token has expired");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtils.validateToken(jwt, username)) {
                String role = (String) jwtUtils.getClaimFromToken(jwt, claims -> claims.get("role"));
                logger.debug("JWT Token validated for user: " + username + " with role: " + role);

                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
                if (role != null) {
                    authorities.add(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
                }

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } else {
                logger.warn("JWT Token validation failed for user: " + username);
            }
        }
        chain.doFilter(request, response);
    }
}
