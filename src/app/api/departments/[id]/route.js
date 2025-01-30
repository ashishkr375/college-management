import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { dept_name } = await request.json();
    const { id } = params;

    await executeQuery(
      'UPDATE Departments SET dept_name = ? WHERE dept_id = ?',
      [dept_name, id]
    );

    return NextResponse.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check for dependencies
    const [dependencies] = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM Programmes WHERE dept_id = ?) as programme_count,
        (SELECT COUNT(*) FROM Faculty WHERE dept_id = ?) as faculty_count
    `, [id, id]);

    if (dependencies.programme_count > 0 || dependencies.faculty_count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with existing programmes or faculty' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM Departments WHERE dept_id = ?', [id]);

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
} 