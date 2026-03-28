package dev.marvin.identityservice.organisation;

public enum OrganizationRole {
    ORG_ADMIN, //Organization Owner/Manager	Full CRUD on Org, Users, and Billing.
    ORG_INSTRUCTOR, //Content Creator	Can create and manage courses for that Org.
    ORG_MEMBER //Learner/Consumer	Can view and take courses assigned to the Org.
}
