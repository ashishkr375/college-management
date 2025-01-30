import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { employee_id, full_name, email, dept_id, is_dept_admin } = await request.json();

    const result = await executeQuery(
      'UPDATE Faculty SET employee_id = ?, full_name = ?, email = ?, dept_id = ?, is_dept_admin = ? WHERE faculty_id = ?',
      [employee_id, full_name, email, dept_id, is_dept_admin, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Faculty updated successfully' });
  } catch (error) {
    console.error('Error updating faculty:', error);
    
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
      { error: 'Failed to update faculty' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await executeQuery(
      'DELETE FROM Faculty WHERE faculty_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Faculty deleted successfully',
      affectedRows: result.affectedRows 
    });

  } catch (error) {
    console.error('Error in DELETE route:', error);
    return NextResponse.json({
      error: 'Cannot delete this faculty member because they are referenced in other records.',
      details: error.sqlMessage
    }, { status: 500 });
  }
} 