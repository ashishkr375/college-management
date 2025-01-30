import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { programme_name, dept_id, level } = await request.json();

    await executeQuery(
      'UPDATE Programmes SET programme_name = ?, dept_id = ?, level = ? WHERE programme_id = ?',
      [programme_name, dept_id, level, id]
    );

    return NextResponse.json({ message: 'Programme updated successfully' });
  } catch (error) {
    console.error('Error updating programme:', error);
    return NextResponse.json(
      { error: 'Failed to update programme' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check for dependencies (batches, courses, etc.)
    const [dependencies] = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM Batches WHERE programme_id = ?) as batch_count,
        (SELECT COUNT(*) FROM Courses WHERE programme_id = ?) as course_count
    `, [id, id]);

    if (dependencies.batch_count > 0 || dependencies.course_count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete programme with existing batches or courses' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM Programmes WHERE programme_id = ?', [id]);

    return NextResponse.json({ message: 'Programme deleted successfully' });
  } catch (error) {
    console.error('Error deleting programme:', error);
    return NextResponse.json(
      { error: 'Failed to delete programme' },
      { status: 500 }
    );
  }
} 