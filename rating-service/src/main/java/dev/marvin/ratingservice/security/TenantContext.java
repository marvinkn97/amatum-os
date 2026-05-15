package dev.marvin.ratingservice.security;

public class TenantContext {
    private TenantContext() {
        /* This utility class should not be instantiated */
    }

    // Define the ScopedValue constant
    public static final ScopedValue<String> TENANT_ID = ScopedValue.newInstance();

    // No more static ThreadLocal fields!
}