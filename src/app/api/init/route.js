import { createProgrammesTable } from '@/lib/db/migrations/create_programmes_table';
import { alterProgrammesTable } from '@/lib/db/migrations/alter_programmes_table';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to alter the table first (in case it exists)
    try {
      await alterProgrammesTable();
    } catch (error) {
      // If altering fails, create the table
      await createProgrammesTable();
    }

    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
} 