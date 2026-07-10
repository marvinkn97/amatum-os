export const environment = {
  production: true,
  apiUrl: "api.amatum.luv2kode.co.ke/",
  keycloak: {
    url: "https://auth.luv2kode.co.ke/",
    realm: 'amatum',
    clientId: 'lms-ui',
  },
  sessionTimeout: 30 * 60 * 1000,
};