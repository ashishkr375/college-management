import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { executeQuery } from './db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          console.log('Checking user access for email:', user.email);

          // Check for faculty/dept admin first
          const [faculty] = await executeQuery(
            'SELECT faculty_id, is_dept_admin, full_name FROM Faculty WHERE email = ?',
            [user.email]
          );

          console.log('Faculty check result:', faculty);

          if (faculty) {
            // Store these in user object for jwt callback
            user.role = faculty.is_dept_admin ? 'dept_admin' : 'faculty';
            user.id = faculty.faculty_id;
            user.name = faculty.full_name;
            return true;
          }

          // Check for super admin
          const [superAdmin] = await executeQuery(
            'SELECT * FROM SuperAdmins WHERE email = ?',
            [user.email]
          );

          if (superAdmin) {
            user.role = 'super_admin';
            return true;
          }

          // Check for student
          const [student] = await executeQuery(
            'SELECT student_id, full_name FROM Students WHERE email = ?',
            [user.email]
          );

          if (student) {
            user.role = 'student';
            user.id = student.student_id;
            user.name = student.full_name;
            return true;
          }

          console.log('No matching user found in database');
          return false;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return false;
    },

    async jwt({ token, user }) {
      console.log('JWT Callback - Incoming token:', token);
      console.log('JWT Callback - Incoming user:', user);

      if (user) {
        // Transfer the role and id from signIn callback
        token.role = user.role;
        token.id = user.id;
      }

      console.log('JWT Callback - Outgoing token:', token);
      return token;
    },

    async session({ session, token }) {
      console.log('Session Callback - Incoming session:', session);
      console.log('Session Callback - Incoming token:', token);

      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }

      console.log('Session Callback - Outgoing session:', session);
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: true, // Enable debug logs
};

export default NextAuth(authOptions); 