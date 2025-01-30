import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { section_name, batch_id } = await request.json();

    await executeQuery(
      'UPDATE Sections SET section_name = ?, batch_id = ? WHERE section_id = ?',
      [section_name, batch_id, id]
    );

    return NextResponse.json({ message: 'Section updated successfully' });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if section has any students
    const [studentCount] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM Students 
      WHERE section_id = ?
    `, [id]);

    if (studentCount.count > 0) {
      return NextResponse.json({
        error: 'Cannot delete this section because it has associated students. Please remove all students from this section first.',
        hasReferences: true
      }, { status: 400 });
    }

    // If no students exist, proceed with section deletion
    const result = await executeQuery(
      'DELETE FROM Sections WHERE section_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Section not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Section deleted successfully',
      affectedRows: result.affectedRows 
    });

  } catch (error) {
    console.error('Error in DELETE route:', error);
    return NextResponse.json({
      error: 'Cannot delete this section because it is being used in other records.',
      details: error.sqlMessage
    }, { status: 500 });
  }
} 