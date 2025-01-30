import { executeQuery } from '@/lib/db';

export async function fetchDashboardStats() {
  try {
    // First get the basic counts
    const [basicStats] = await executeQuery(`
      SELECT
        (SELECT COUNT(*) FROM Departments) as departmentCount,
        (SELECT COUNT(*) FROM Programmes) as programmeCount,
        (SELECT COUNT(*) FROM Faculty) as facultyCount,
        (SELECT COUNT(*) FROM Sections) as sectionCount,
        (SELECT COUNT(*) FROM Students) as studentCount
    `);

    // Get department distribution separately
    const deptDistribution = await executeQuery(`
      SELECT 
        d.dept_name as name,
        COUNT(p.programme_id) as value
      FROM Departments d
      LEFT JOIN Programmes p ON d.dept_id = p.dept_id
      GROUP BY d.dept_id, d.dept_name
    `);

    // Get student growth separately
    const studentGrowth = await executeQuery(`
      SELECT 
        b.year,
        COUNT(DISTINCT s.student_id) as students
      FROM Batches b
      LEFT JOIN Sections sec ON b.batch_id = sec.batch_id
      LEFT JOIN Students s ON sec.section_id = s.section_id
      GROUP BY b.year
      ORDER BY b.year
    `);

    return {
      ...basicStats,
      departmentDistribution: deptDistribution || [],
      studentGrowth: studentGrowth || []
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values instead of throwing
    return {
      departmentCount: 0,
      programmeCount: 0,
      facultyCount: 0,
      sectionCount: 0,
      studentCount: 0,
      departmentDistribution: [],
      studentGrowth: []
    };
  }
}

export async function fetchDeptAdminStats(facultyId) {
  try {
    const [faculty] = await executeQuery(
      'SELECT dept_id FROM Faculty WHERE faculty_id = ?',
      [facultyId]
    );

    const [stats] = await executeQuery(`
      SELECT
        (
          SELECT COUNT(DISTINCT s.student_id)
          FROM Students s
          JOIN Sections sec ON s.section_id = sec.section_id
          JOIN Batches b ON sec.batch_id = b.batch_id
          JOIN Programmes p ON b.programme_id = p.programme_id
          WHERE p.dept_id = ?
        ) as studentCount,
        (
          SELECT COUNT(DISTINCT c.course_id)
          FROM Courses c
          JOIN Programmes p ON c.programme_id = p.programme_id
          WHERE p.dept_id = ?
        ) as courseCount,
        (
          SELECT COUNT(*)
          FROM Faculty
          WHERE dept_id = ?
        ) as facultyCount,
        (
          SELECT COUNT(DISTINCT sec.section_id)
          FROM Sections sec
          JOIN Batches b ON sec.batch_id = b.batch_id
          JOIN Programmes p ON b.programme_id = p.programme_id
          WHERE p.dept_id = ?
        ) as sectionCount
    `, [faculty.dept_id, faculty.dept_id, faculty.dept_id, faculty.dept_id]);

    return stats;
  } catch (error) {
    console.error('Error fetching department admin stats:', error);
    throw error;
  }
} 