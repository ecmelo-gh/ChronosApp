declare module 'phoenix'

// D3 modules
declare module 'd3-array'
declare module 'd3-color'
declare module 'd3-ease'
declare module 'd3-interpolate'
declare module 'd3-path'
declare module 'd3-scale'
declare module 'd3-selection'
declare module 'd3-shape'
declare module 'd3-time'
declare module 'd3-timer'
declare module 'd3-transition'

// Google APIs
declare module 'googleapis' {
  interface Credentials {
    access_token: string
    refresh_token?: string
    scope: string
    token_type: string
    expiry_date?: number
  }

  interface OAuth2Client {
    generateAuthUrl: (options: { access_type: string; scope: string[]; prompt?: string }) => string;
    getToken: (code: string) => Promise<{ tokens: Credentials }>;
    setCredentials: (tokens: Credentials) => void;
  }

  export const google: {
    auth: {
      OAuth2: new (
        clientId: string,
        clientSecret: string,
        redirectUri: string
      ) => OAuth2Client;
    };
    people: (options: { version: string; auth: OAuth2Client }) => {
      people: {
        connections: {
          list: (params: {
            personFields: string[];
            resourceName: string;
          }) => Promise<{
            data: {
              connections?: Array<{
                names?: Array<{ displayName?: string }>;
                emailAddresses?: Array<{ value?: string }>;
                phoneNumbers?: Array<{ value?: string }>;
                photos?: Array<{ url?: string }>;
              }>;
            };
          }>;
        };
      };
    };
  };
}
