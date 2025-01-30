import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { programme_id, year } = await request.json();

    await executeQuery(
      'UPDATE Batches SET programme_id = ?, year = ? WHERE batch_id = ?',
      [programme_id, year, id]
    );

    return NextResponse.json({ message: 'Batch updated successfully' });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log('Attempting to delete batch with ID:', id);

    // First check if there are any sections using this batch
    const [sectionCount] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM Sections 
      WHERE batch_id = ?
    `, [id]);

    if (sectionCount.count > 0) {
      return NextResponse.json({
        error: 'Cannot delete this batch because it has associated sections. Please delete all sections in this batch first.',
        hasReferences: true
      }, { status: 400 });
    }

    // If no sections exist, proceed with batch deletion
    const result = await executeQuery(
      'DELETE FROM Batches WHERE batch_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Batch not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Batch deleted successfully',
      affectedRows: result.affectedRows 
    });

  } catch (error) {
    console.error('Error in DELETE route:', error);
    return NextResponse.json({
      error: 'Cannot delete this batch because it is being used in other records.',
      details: error.sqlMessage
    }, { status: 500 });
  }
} 