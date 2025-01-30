import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect based on user role
  switch (session.user.role) {
    case 'super_admin':
      redirect('/admin/dashboard');
    case 'dept_admin':
      redirect('/admin/dept-admin/dashboard');
    case 'faculty':
      redirect('/faculty/dashboard');
    case 'student':
      redirect('/student/dashboard');
    default:
      redirect('/auth/signin');
  }
}
