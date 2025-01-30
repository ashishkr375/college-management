import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section_id = searchParams.get('section_id');

    const students = await executeQuery(`
      SELECT 
        s.*,
        sec.section_name
      FROM Students s
      LEFT JOIN Sections sec ON s.section_id = sec.section_id
      WHERE s.section_id = ?
      ORDER BY s.created_at DESC
    `, [section_id]);

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { roll_number, full_name, email, section_id } = await request.json();

    const result = await executeQuery(
      'INSERT INTO Students (roll_number, full_name, email, section_id) VALUES (?, ?, ?, ?)',
      [roll_number, full_name, email, section_id]
    );

    return NextResponse.json({ 
      id: result.insertId,
      message: 'Student added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('roll_number')) {
        return NextResponse.json(
          { error: 'Roll number already exists' },
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
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
} 