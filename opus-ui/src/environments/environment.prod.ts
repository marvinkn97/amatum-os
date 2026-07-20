export const environment = {
  production: true,
  apiUrl: "https://api.amatum.luv2kode.co.ke/api/",
  keycloak: {
    url: "https://auth.luv2kode.co.ke/",
    realm: 'amatum',
    clientId: 'opus-ui',
  },
  sessionTimeout: 30 * 60 * 1000,
  orgRoles: {
    manager: '/Managers',
    hr: '/HR',
    talent: '/Talents'
  }
};