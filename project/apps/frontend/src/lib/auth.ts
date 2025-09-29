import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AUTH_CONFIG } from './constants';

async function refreshAccessToken(token: {
  refreshToken?: string;
  accessToken?: string;
  accessTokenExpires?: number;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: token.refreshToken,
        }),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.data.access_token,
      refreshToken: refreshedTokens.data.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
    } as JWT;
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    } as JWT;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call backend API to login and get JWT token
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            return null;
          }

          const loginData = await response.json();

          if (
            !loginData.data ||
            !loginData.data.access_token ||
            !loginData.data.user
          ) {
            // eslint-disable-next-line no-console
            console.error('Invalid login response:', loginData);
            return null;
          }

          const { access_token, user } = loginData.data;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar || null,
            accessToken: access_token,
            refreshToken: loginData.data.refresh_token,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: AUTH_CONFIG.SESSION.MAX_AGE,
    updateAge: AUTH_CONFIG.SESSION.UPDATE_AGE,
  },
  jwt: {
    maxAge: AUTH_CONFIG.SESSION.MAX_AGE,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        return {
          ...token,
          role: user.role,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires:
            Date.now() + AUTH_CONFIG.TOKEN.ACCESS_TOKEN_EXPIRY,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | 'END_USER'
          | 'SUPPORT_STAFF'
          | 'SUPPORT_MANAGER'
          | 'ADMIN';
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: AUTH_CONFIG.COOKIES.SESSION_TOKEN_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
