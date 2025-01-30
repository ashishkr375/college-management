'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function FacultyNavigation() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Map of path segments to display names
  const pathNames = {
    faculty: 'Dashboard',
    attendance: 'Attendance',
    marks: 'Marks',
    students: 'Students',
    courses: 'Courses',
    profile: 'Profile'
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link
        href="/faculty/dashboard"
        className="hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>
      {pathSegments.slice(1).map((segment, index) => {
        // Skip courseId segments
        if (segment.match(/^[0-9a-fA-F-]+$/)) return null;
        
        return (
          <span key={segment} className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            <span className={index === pathSegments.length - 2 ? "text-foreground font-medium" : ""}>
              {pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)}
            </span>
          </span>
        );
      })}
    </nav>
  );
} 