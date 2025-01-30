import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { roll_number, full_name, email, section_id } = await request.json();

    const result = await executeQuery(
      'UPDATE Students SET roll_number = ?, full_name = ?, email = ?, section_id = ? WHERE student_id = ?',
      [roll_number, full_name, email, section_id, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    
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
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await executeQuery(
      'DELETE FROM Students WHERE student_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Student deleted successfully',
      affectedRows: result.affectedRows 
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({
      error: 'Cannot delete this student because they are referenced in other records.',
      details: error.sqlMessage
    }, { status: 500 });
  }
} 