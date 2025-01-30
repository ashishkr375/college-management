import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const batch_id = searchParams.get('batch_id');

    if (batch_id) {
      // Get sections for specific batch
      const sections = await executeQuery(`
        SELECT s.*
        FROM Sections s
        WHERE s.batch_id = ?
        ORDER BY s.section_name
      `, [batch_id]);
      return NextResponse.json(sections);
    }

    // Original query for all sections
    const sections = await executeQuery(`
      SELECT 
        s.*,
        b.year as batch_year,
        p.programme_name,
        d.dept_name
      FROM Sections s
      LEFT JOIN Batches b ON s.batch_id = b.batch_id
      LEFT JOIN Programmes p ON b.programme_id = p.programme_id
      LEFT JOIN Departments d ON p.dept_id = d.dept_id
      ORDER BY s.created_at DESC
    `);

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { section_name, batch_id } = await request.json();

    const result = await executeQuery(
      'INSERT INTO Sections (section_name, batch_id) VALUES (?, ?)',
      [section_name, batch_id]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
} 