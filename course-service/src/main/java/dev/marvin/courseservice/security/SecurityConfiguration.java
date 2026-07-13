package dev.marvin.courseservice.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SecurityConfiguration {
    private final KeycloakProps keycloakProps;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .authorizeHttpRequests(c -> c
                        .requestMatchers("/actuator/**",
                                "/api/categories/all",
                                "/api/categories/dropdown",
                                "/api/mux/webhooks",
                                "/api/courses/public/**",
                                "/api/courses/*/public",
                                "/swagger-ui/**",
                                "/v3/api-docs/**")
                        .permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(c -> c.jwt(j -> j.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            Map<String, String> clients = keycloakProps.getClients();

            if (resourceAccess == null || clients == null) {
                log.error("Resource access or clients map is null");
                return Collections.emptyList();
            }

            // Extract roles from all client IDs defined in application-dev.yml
            return clients.values().stream()
                    .filter(resourceAccess::containsKey)
                    .map(clientId -> (Map<String, Object>) resourceAccess.get(clientId))
                    .filter(clientMap -> clientMap.containsKey("roles"))
                    .flatMap(clientMap -> ((List<String>) clientMap.get("roles")).stream())
                    .map(role -> "ROLE_" + role.toUpperCase())
                    .distinct()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        });
        return converter;
    }
}
