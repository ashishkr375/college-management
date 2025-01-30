import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const programme_id = searchParams.get('programme_id');

    if (programme_id) {
      // Get batches for specific programme
      const batches = await executeQuery(`
        SELECT b.*
        FROM Batches b
        WHERE b.programme_id = ?
        ORDER BY b.year DESC
      `, [programme_id]);
      return NextResponse.json(batches);
    }

    // Original query for all batches
    const batches = await executeQuery(`
      SELECT 
        b.*,
        p.programme_name,
        d.dept_name
      FROM Batches b
      LEFT JOIN Programmes p ON b.programme_id = p.programme_id
      LEFT JOIN Departments d ON p.dept_id = d.dept_id
      ORDER BY b.created_at DESC
    `);

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { programme_id, year } = await request.json();

    const result = await executeQuery(
      'INSERT INTO Batches (programme_id, year) VALUES (?, ?)',
      [programme_id, year]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
} 