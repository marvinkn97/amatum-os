package dev.marvin.courseservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ServiceTokenProvider {
    private final OAuth2AuthorizedClientManager authorizedClientManager;

    public String getAccessToken() {
        OAuth2AuthorizeRequest request = OAuth2AuthorizeRequest
                        .withClientRegistrationId("identity-client")
                        .principal("identity-client")
                        .build();

        OAuth2AuthorizedClient client = authorizedClientManager.authorize(request);

        if (client == null) {
            throw new RuntimeException("Failed to obtain access token");
        }

        OAuth2AccessToken accessToken = client.getAccessToken();

        return accessToken.getTokenValue();
    }
}