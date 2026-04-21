package dev.marvin.enrollmentservice.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class TenantFilter implements Filter {
    private final JwtDecoder jwtDecoder;

    public TenantFilter(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String authHeader = req.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            Jwt jwt;
            try {
                jwt = jwtDecoder.decode(token);
            } catch (Exception _) {
                sendProblem(res, HttpStatus.UNAUTHORIZED, "Invalid token");
                return;
            }

            List<String> tenantIds = extractTenantIdsFromToken(jwt);
            String requestedTenantId = req.getHeader("x-tenant-id");

            if (requestedTenantId != null && !tenantIds.contains(requestedTenantId)) {
                sendProblem(res, HttpStatus.FORBIDDEN, "Requested tenant is not authorized for this user");
                return;
            }

            // Bind tenantId for the request
            ScopedValue.where(TenantContext.TENANT_ID, requestedTenantId)
                    .run(() -> {
                        try {
                            chain.doFilter(request, response);
                        } catch (Exception e) {
                            throw new IllegalStateException(e);
                        }
                    });
        } else {
            // No token, just continue
            chain.doFilter(request, response);
        }
    }

    private void sendProblem(HttpServletResponse res, HttpStatus status, String detail) throws IOException {
        ProblemDetail problem = ProblemDetail.forStatus(status);
        problem.setTitle(status.getReasonPhrase());
        problem.setDetail(detail);

        res.setStatus(status.value());
        res.setContentType("application/problem+json");
        res.getWriter().write(problem.toString());
        res.getWriter().flush();
    }

    private List<String> extractTenantIdsFromToken(Jwt jwt) {
        Map<String, Map<String, String>> organizations = jwt.getClaim("organization");

        if (organizations == null || organizations.isEmpty()) {
            return Collections.emptyList();
        }

        return organizations.values().stream()
                .map(org -> org.get("id"))
                .toList();
    }
}