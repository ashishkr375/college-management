import { StudentNavigation } from '@/components/student-navigation';

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-5">
        <StudentNavigation />
        {children}
      </div>
    </div>
  );
} 