export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api/",
  keycloak: {
    url: "http://localhost:9000/",
    realm: 'amatum',
    clientId: 'lms-ui',
  },
  sessionTimeout: 30 * 60 * 1000,
  orgRoles: {
    manager: '/Managers',
    instructor: '/Instructors',
    learner: '/Learners'
  }
};