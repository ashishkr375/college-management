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
    async signIn({ user, account }) {
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
            user.role = faculty.is_dept_admin === 1 ? 'dept_admin' : 'faculty';
            user.id = faculty.faculty_id;
            user.name = faculty.full_name;
            return true;
          }

          // Check for super admin
          const [superAdmin] = await executeQuery(
            'SELECT * FROM SuperAdmin WHERE email = ?',
            [user.email]
          );

          if (superAdmin) {
            user.role = 'super_admin';
            return true;
          }

          // Check for student
          const [student] = await executeQuery(
            'SELECT student_id, roll_number, full_name FROM Students WHERE email = ?',
            [user.email]
          );

          if (student) {
            user.role = 'student';
            user.id = student.student_id;
            user.name = student.full_name;
            user.roll_number = student.roll_number;
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

    async jwt({ token }) {
      console.log('JWT Callback - Incoming token:', token);
      try {
        // Refresh user details from the database on every request
        if (token.id && token.role === 'student') {
          const [student] = await executeQuery(
            'SELECT student_id, roll_number, full_name FROM Students WHERE email = ?',
            [token.email]
          );

          if (student) {
            token.roll_number = student.roll_number;
            token.name = student.full_name;
          }
        }
      } catch (error) {
        console.error('Error fetching fresh user data:', error);
      }

      console.log('JWT Callback - Outgoing token:', token);
      return token;
    },

    async session({ session, token }) {
      console.log('Session Callback - Incoming session:', session);

      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.name = token.name;
        if (token.role === 'student') {
          session.user.roll_number = token.roll_number;
        }
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