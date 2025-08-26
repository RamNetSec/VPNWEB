import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../../../../lib/database';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with:', { 
          username: credentials?.username, 
          passwordProvided: !!credentials?.password 
        });

        if (!credentials?.username || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          const db = getDatabase();
          console.log('📊 Database connection established');
          
          // Preparar consulta segura para prevenir SQL injection
          const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
          const user = stmt.get(credentials.username);
          
          console.log('👤 User found:', !!user);
          
          if (user) {
            console.log('🔍 User details:', {
              id: user.id,
              username: user.username,
              role: user.role,
              hasPasswordHash: !!user.password_hash
            });
            
            const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash);
            console.log('🔑 Password match:', passwordMatch);
            
            if (passwordMatch) {
              console.log('✅ Authentication successful');
              return {
                id: user.id.toString(),
                name: user.username,
                username: user.username,
                role: user.role,
                email: user.email || `${user.username}@vpn.local`
              };
            }
          }
          
          console.log('❌ Authentication failed');
          return null;
        } catch (error) {
          console.error('💥 Auth error:', error);
          return null;
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.id = token.sub;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
  },

  secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-for-development-only',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
