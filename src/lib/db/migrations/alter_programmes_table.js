import { executeQuery } from '@/lib/db';

export async function alterProgrammesTable() {
  try {
    // Add programme_type column if it doesn't exist
    await executeQuery(`
      ALTER TABLE Programmes
      ADD COLUMN IF NOT EXISTS programme_type ENUM('Bachelors', 'Masters', 'Integrated') NOT NULL AFTER dept_id
    `);

    // Add duration_years column if it doesn't exist
    await executeQuery(`
      ALTER TABLE Programmes
      ADD COLUMN IF NOT EXISTS duration_years INT NOT NULL AFTER programme_type
    `);

    console.log('Programmes table altered successfully');
  } catch (error) {
    console.error('Error altering Programmes table:', error);
    throw error;
  }
} 