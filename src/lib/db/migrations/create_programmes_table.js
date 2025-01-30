import { executeQuery } from '@/lib/db';

export async function createProgrammesTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Programmes (
        programme_id INT PRIMARY KEY AUTO_INCREMENT,
        programme_name VARCHAR(100) NOT NULL,
        dept_id INT NOT NULL,
        programme_type ENUM('Bachelors', 'Masters', 'Integrated') NOT NULL,
        duration_years INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dept_id) REFERENCES Departments(dept_id)
      )
    `);
    console.log('Programmes table created successfully');
  } catch (error) {
    console.error('Error creating Programmes table:', error);
    throw error;
  }
} 