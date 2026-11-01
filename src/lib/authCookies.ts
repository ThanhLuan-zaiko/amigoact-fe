// Tokens live in httpOnly cookies, so browser scripts can never read them.
import type { TokenPair } from "./account";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

type TokenCookie = {
  name: string;
  value: string;
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

function tokenCookie(name: string, value: string, maxAge: number): TokenCookie {
  return {
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function tokenCookies(tokens: TokenPair): TokenCookie[] {
  return [
    // The cookie expires with the JWT, so a missing cookie means "refresh now".
    tokenCookie(ACCESS_COOKIE, tokens.access_token, tokens.expires_in),
    tokenCookie(
      REFRESH_COOKIE,
      tokens.refresh_token,
      tokens.refresh_expires_in,
    ),
  ];
}
