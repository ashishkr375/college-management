import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const section_id = formData.get('section_id');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const requiredColumns = ['roll_number', 'full_name', 'email'];
    
    // Validate headers
    for (const col of requiredColumns) {
      if (!headers.includes(col)) {
        return NextResponse.json(
          { error: `Missing required column: ${col}` },
          { status: 400 }
        );
      }
    }

    const errors = [];
    let imported = 0;

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      try {
        const row = rows[i];
        if (row.length !== headers.length) continue; // Skip malformed rows

        const student = {};
        headers.forEach((header, index) => {
          student[header] = row[index].trim();
        });

        await executeQuery(
          'INSERT INTO Students (roll_number, full_name, email, section_id) VALUES (?, ?, ?, ?)',
          [student.roll_number, student.full_name, student.email, section_id]
        );

        imported++;
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.sqlMessage || error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      imported,
      errors
    });
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json(
      { error: 'Failed to import students' },
      { status: 500 }
    );
  }
} 