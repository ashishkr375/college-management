import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const departments = await executeQuery(`
      SELECT 
        d.*,
        COUNT(DISTINCT p.programme_id) as program_count,
        COUNT(DISTINCT f.faculty_id) as faculty_count
      FROM Departments d
      LEFT JOIN Programmes p ON d.dept_id = p.dept_id
      LEFT JOIN Faculty f ON d.dept_id = f.dept_id
      GROUP BY d.dept_id
      ORDER BY d.created_at DESC
    `);

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { dept_name } = await request.json();

    const result = await executeQuery(
      'INSERT INTO Departments (dept_name) VALUES (?)',
      [dept_name]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
} 