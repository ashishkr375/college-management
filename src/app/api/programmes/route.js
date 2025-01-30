import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dept_id = searchParams.get('dept_id');

    if (dept_id) {
      // Get programmes for specific department
      const programmes = await executeQuery(`
        SELECT 
          p.*,
          d.dept_name
        FROM Programmes p
        INNER JOIN Departments d ON p.dept_id = d.dept_id
        WHERE p.dept_id = ?
        ORDER BY p.programme_name
      `, [dept_id]);
      return NextResponse.json(programmes);
    }

    // Original query for all programmes
    const programmes = await executeQuery(`
      SELECT 
        p.*,
        d.dept_name
      FROM Programmes p
      LEFT JOIN Departments d ON p.dept_id = d.dept_id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(programmes);
  } catch (error) {
    console.error('Error fetching programmes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programmes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { programme_name, dept_id, level } = await request.json();

    const result = await executeQuery(
      'INSERT INTO Programmes (programme_name, dept_id, level) VALUES (?, ?, ?)',
      [programme_name, dept_id, level]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating programme:', error);
    return NextResponse.json(
      { error: 'Failed to create programme' },
      { status: 500 }
    );
  }
} 