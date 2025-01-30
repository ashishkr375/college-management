import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const faculty = await executeQuery(`
      SELECT 
        f.*,
        d.dept_name
      FROM Faculty f
      LEFT JOIN Departments d ON f.dept_id = d.dept_id
      ORDER BY f.created_at DESC
    `);

    return NextResponse.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculty' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { employee_id, full_name, email, dept_id, is_dept_admin } = await request.json();

    const result = await executeQuery(
      'INSERT INTO Faculty (employee_id, full_name, email, dept_id, is_dept_admin) VALUES (?, ?, ?, ?, ?)',
      [employee_id, full_name, email, dept_id, is_dept_admin]
    );

    return NextResponse.json({ 
      id: result.insertId,
      message: 'Faculty created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating faculty:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('employee_id')) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        );
      }
      if (error.sqlMessage.includes('email')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create faculty' },
      { status: 500 }
    );
  }
} 