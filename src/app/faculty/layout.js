import { FacultyNavigation } from '@/components/faculty-navigation';

export default function FacultyLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-5">
        <FacultyNavigation />
        {children}
      </div>
    </div>
  );
} 