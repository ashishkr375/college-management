import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const dept_id = formData.get('dept_id');

    if (!file || !dept_id) {
      return NextResponse.json(
        { error: 'File and department are required' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const errors = [];
    let imported = 0;

    for (let [index, record] of records.entries()) {
      try {
        // Validate required fields
        if (!record.employee_id || !record.full_name || !record.email) {
          throw new Error('Missing required fields');
        }

        // Set default value for is_dept_admin if not provided
        const is_dept_admin = record.is_dept_admin === '1' ? 1 : 0;

        // Check if faculty already exists
        const existing = await executeQuery(
          'SELECT faculty_id FROM Faculty WHERE employee_id = ? OR email = ?',
          [record.employee_id, record.email]
        );

        if (existing.length > 0) {
          throw new Error('Faculty with this employee ID or email already exists');
        }

        // Insert faculty
        await executeQuery(
          `INSERT INTO Faculty (employee_id, full_name, email, dept_id, is_dept_admin) 
           VALUES (?, ?, ?, ?, ?)`,
          [record.employee_id, record.full_name, record.email, dept_id, is_dept_admin]
        );

        imported++;
      } catch (error) {
        errors.push({
          row: index + 2, // +2 because index starts at 0 and we skip header row
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      imported,
      errors,
    });
  } catch (error) {
    console.error('Error importing faculty:', error);
    return NextResponse.json(
      { error: 'Failed to import faculty' },
      { status: 500 }
    );
  }
} 