package dev.marvin.courseservice.security;

public class TenantContext {
    // Define the ScopedValue constant
    public static final ScopedValue<String> TENANT_ID = ScopedValue.newInstance();

    // No more static ThreadLocal fields!
}