package dev.marvin.courseservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.*;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

@Configuration
public class OAuth2ClientConfig {

    @Bean
    OAuth2AuthorizedClientManager authorizedClientManager(ClientRegistrationRepository clients, OAuth2AuthorizedClientService service) {

        OAuth2AuthorizedClientProvider provider = OAuth2AuthorizedClientProviderBuilder.builder()
                        .clientCredentials()
                        .build();

        AuthorizedClientServiceOAuth2AuthorizedClientManager manager = new AuthorizedClientServiceOAuth2AuthorizedClientManager(clients, service);

        manager.setAuthorizedClientProvider(provider);

        return manager;
    }
}