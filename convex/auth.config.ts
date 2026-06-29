const clientid = process.env.WORKOS_CLIENT_ID;

const authConfig = {
  providers: [
    {
      type: "customJwt",
      issuer: `https://api.workos.com/`,
      algorithm: "RS256",
      applicationID: clientid,
      jwks: `https://api.workos.com/sso/jwks/${clientid}`,
    },
    {
      type: "customJwt",
      issuer: `https://api.workos.com/user_management/${clientid}`,
      algorithm: "RS256",
      jwks: `https://api.workos.com/sso/jwks/${clientid}`,
    },
  ],
};

export default authConfig;
