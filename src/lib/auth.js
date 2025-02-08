import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { executeQuery } from './db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          const userQuery = `
            SELECT 'faculty' AS role, faculty_id AS id, full_name FROM Faculty WHERE email = ? 
            UNION ALL 
            SELECT 'super_admin' AS role, id AS id, full_name FROM SuperAdmin WHERE email = ? 
            UNION ALL 
            SELECT 'student' AS role, student_id AS id, full_name FROM Students WHERE email = ?
            LIMIT 1;
          `;
          const result = await executeQuery(userQuery, [email, email, email]);

          if (result.length === 0) {
            return null;
          }

          const user = result[0];

          const passwordQuery = `
            SELECT password FROM ${user.role === 'faculty' ? 'Faculty' : user.role === 'super_admin' ? 'SuperAdmin' : 'Students'} WHERE email = ?;
          `;
          const passwordResult = await executeQuery(passwordQuery, [email]);

          if (passwordResult.length === 0 || !bcrypt.compareSync(password, passwordResult[0].password)) {
            return null;
          }

          if (user.role === 'faculty') {
            const deptAdminQuery = `SELECT is_dept_admin FROM Faculty WHERE email = ?;`;
            const deptAdminResult = await executeQuery(deptAdminQuery, [email]);

            if (deptAdminResult.length > 0 && deptAdminResult[0].is_dept_admin === 1) {
              user.role = 'dept_admin';
            }
          }

          if (user.role === 'student') {
            const studentQuery = `SELECT roll_number FROM Students WHERE student_id = ?;`;
            const studentResult = await executeQuery(studentQuery, [user.id]);

            if (studentResult.length > 0) {
              user.roll_number = studentResult[0].roll_number;
            }
          }

          return {
            id: user.id,
            email,
            name: user.full_name,
            role: user.role,
            roll_number: user.roll_number || null,
          };
        } catch (error) {
          console.error('Error during authentication', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (user) {
        console.log('Incoming Sign-In User:', user);
        return true;
      }
      console.log('Sign-In failed: No user found');
      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        console.log('Incoming JWT User:', user);
        token.role = user.role;
        token.id = user.id;
        token.name = user.name;
        if (user.role === 'student') {
          token.roll_number = user.roll_number;
        }
      }
      console.log('Outgoing JWT Token:', token);
      return token;
    },

    async session({ session, token }) {
      session.user = session.user || {};
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.name = token.name;
      if (token.role === 'student') {
        session.user.roll_number = token.roll_number;
      }

      console.log('Incoming Session:', session);
      console.log('Outgoing Session:', { user: session.user });
      return session;
    },
  },

  pages: {
    signIn: '/api/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
  },

  debug: true,
};

export default NextAuth(authOptions);