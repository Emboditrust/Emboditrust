import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Admin from '@/models/Admin';
import connectDB from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// Validate environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is not set');
}

if (!process.env.NEXTAUTH_URL) {
  console.warn('NEXTAUTH_URL environment variable is not set, using default');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/admin-login',
    signOut: '/',
    error: '/admin-login',
  },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "admin@emboditrust.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            return null;
          }

          await connectDB();

          // Find admin by email
          const admin = await Admin.findOne({ 
            email: credentials.email.toLowerCase().trim() 
          });
          
          if (!admin) {
            console.error('Admin not found:', credentials.email);
            return null;
          }

          // Import bcrypt dynamically to avoid issues
          const bcrypt = await import('bcryptjs');
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
            console.error('Invalid password for:', credentials.email);
            return null;
          }

          console.log('✅ Authentication successful for:', credentials.email);

          // Return user object
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: "admin",
          };

        } catch (error: any) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as "admin",
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to admin dashboard after login
      if (url.includes('/admin-login')) {
        return `${baseUrl}/admin`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    }
  },

  events: {
    async signIn({ user }) {
      console.log('✅ User signed in:', user.email);
      
      // Update last login
      try {
        await connectDB();
        await Admin.findByIdAndUpdate(user.id, { 
          lastLogin: new Date() 
        });
      } catch (error) {
        console.error('Failed to update last login:', error);
      }
    },
    async signOut() {
      console.log('👋 User signed out');
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// Export the NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Helper function to verify session in API routes
export async function verifySession(request: NextRequest): Promise<{
  success: boolean;
  user: { id: string; email: string; name: string; role: string } | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { success: false, user: null };
    }

    return { 
      success: true, 
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, user: null };
  }
}