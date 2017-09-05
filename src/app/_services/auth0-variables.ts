interface AuthConfig {
  CLIENT_ID: string;
  CLIENT_DOMAIN: string;
  AUDIENCE: string;
  REDIRECT: string;
  SCOPE: string;
}

export const AUTH_CONFIG: AuthConfig = {
  CLIENT_ID    : 'iGuBuQAbaFNkS33BKJtL6B5Wl39JCaPd',
  CLIENT_DOMAIN: 'bperraud.eu.auth0.com',
  AUDIENCE     : 'chat-tree-api',
  REDIRECT     : 'http://localhost:4200/callback',
  SCOPE        : 'openid'
};
