import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin";
    };
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    email: string;
    name: string;
    role: "admin";
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: "admin";
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}