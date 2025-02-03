const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

async function createTables() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');

    // Drop existing tables one by one in reverse order of dependencies
    const tablesToDrop = [
      'Marks',
      'Attendance',
      'CourseMaterials',
      'FacultyCourses',
      'Students',
      'Sections',
      'Batches',
      'Courses',
      'Programmes',
      'Faculty',
      'Departments',
      'SuperAdmin'
    ];

    for (const table of tablesToDrop) {
      await connection.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table ${table} if it existed`);
    }

    // Create tables in order of dependencies
    const createTableQueries = [
      // SuperAdmin table
      `CREATE TABLE SuperAdmin (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Departments table
      `CREATE TABLE Departments (
        dept_id INT PRIMARY KEY AUTO_INCREMENT,
        dept_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Faculty table
      `CREATE TABLE Faculty (
        faculty_id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        dept_id INT NOT NULL,
        is_dept_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dept_id) REFERENCES Departments(dept_id)
      )`,

      // Programmes table
      `CREATE TABLE Programmes (
        programme_id INT PRIMARY KEY AUTO_INCREMENT,
        programme_name VARCHAR(100) NOT NULL,
        level VARCHAR(255) NOT NULL,
        dept_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dept_id) REFERENCES Departments(dept_id)
      )`,

      // Courses table
      `CREATE TABLE Courses (
        course_id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        credits INT NOT NULL,
        programme_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (programme_id) REFERENCES Programmes(programme_id)
      )`,

      // Batches table
      `CREATE TABLE Batches (
        batch_id INT PRIMARY KEY AUTO_INCREMENT,
        year INT NOT NULL,
        programme_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (programme_id) REFERENCES Programmes(programme_id)
      )`,

      // Sections table
      `CREATE TABLE Sections (
        section_id INT PRIMARY KEY AUTO_INCREMENT,
        section_name VARCHAR(20) NOT NULL,
        batch_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES Batches(batch_id)
      )`,

      // Students table
      `CREATE TABLE Students (
        student_id INT PRIMARY KEY AUTO_INCREMENT,
        roll_number VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        section_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES Sections(section_id)
      )`,

      // Faculty Courses table
      `CREATE TABLE FacultyCourses (
        faculty_course_id INT PRIMARY KEY AUTO_INCREMENT,
        faculty_id INT NOT NULL,
        course_id INT NOT NULL,
        section_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_assignment (course_id, section_id),
        FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id),
        FOREIGN KEY (course_id) REFERENCES Courses(course_id),
        FOREIGN KEY (section_id) REFERENCES Sections(section_id)
      )`,

      // Course Materials table
      `CREATE TABLE CourseMaterials (
        material_id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        faculty_id INT NOT NULL,
        course_id INT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id),
        FOREIGN KEY (course_id) REFERENCES Courses(course_id)
      )`,
      `CREATE TABLE Attendance (
        attendance_id INT PRIMARY KEY AUTO_INCREMENT,
        roll_number VARCHAR(20) NOT NULL,
        course_id int NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,  
        total_classes INT NOT NULL,
        present_count INT NOT NULL,
        faculty_course_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        remark VARCHAR(255) DEFAULT NULL,
        flag INT DEFAULT 1,
        FOREIGN KEY (roll_number) REFERENCES Students(roll_number),
        FOREIGN KEY (course_id) REFERENCES Courses(course_id),
        FOREIGN KEY (faculty_course_id) REFERENCES FacultyCourses(faculty_course_id)
      )`,

      `CREATE TABLE FacultySchedule (
        schedule_id INT PRIMARY KEY AUTO_INCREMENT,
        faculty_course_id INT NOT NULL,
        schedule_date DATE NOT NULL,
        schedule_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_course_id) REFERENCES FacultyCourses(faculty_course_id)
    )`,

      // Marks table
      `CREATE TABLE Marks (
        mark_id INT PRIMARY KEY AUTO_INCREMENT,
        roll_number VARCHAR(20) NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        assessment_type VARCHAR(225) NOT NULL,
        marks DECIMAL(5,2) NOT NULL,
        marked_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_mark (roll_number, course_code, assessment_type),
        FOREIGN KEY (roll_number) REFERENCES Students(roll_number),
        FOREIGN KEY (course_code) REFERENCES Courses(course_code),
        FOREIGN KEY (marked_by) REFERENCES Faculty(faculty_id)
      )`
    ];

    // Execute each CREATE TABLE query separately
    for (const query of createTableQueries) {
      await connection.execute(query);
      console.log('Created table successfully');
    }

    // Insert initial data
    const initialDataQueries = [
      // Insert Super Admin
      `INSERT INTO SuperAdmin (admin_id, full_name, email) 
       VALUES ('SA001', 'Super Admin', 'ashishk.dd22.cs@nitp.ac.in')`,

      `INSERT INTO SuperAdmin (admin_id, full_name, email) 
       VALUES ('SA002', 'Super Admin', 'aashishs.ug23.cs@nitp.ac.in')`,

      // Insert department
      `INSERT INTO Departments (dept_name) 
       VALUES ('Computer Science')`,

      // Insert faculty member as department admin
      `INSERT INTO Faculty (employee_id, full_name, email, dept_id, is_dept_admin) 
       VALUES ('CSE001', 'Admin User', 'kumarashish98526@gmail.com', 1, 1)`,

      // Insert regular faculty member
      `INSERT INTO Faculty (employee_id, full_name, email, dept_id, is_dept_admin) 
       VALUES ('CSE002', 'Faculty User', 'kumarashish80832@gmail.com', 1, 0)`,

      // Insert a programme
      `INSERT INTO Programmes (programme_name, level, dept_id) 
       VALUES ('B.Tech Computer Science', 'UG', 1)`,

      // Insert a batch
      `INSERT INTO Batches (year, programme_id) 
       VALUES (2022, 1)`,

      // Insert a section
      `INSERT INTO Sections (section_name, batch_id) 
       VALUES ('A', 1)`,

      // Insert a student
      `INSERT INTO Students (roll_number, full_name, email, section_id) 
       VALUES ('2022CSB001', 'Student User', 'araash375@gmail.com', 1)`
    ];

    // Execute each INSERT query separately
    for (const query of initialDataQueries) {
      await connection.execute(query);
      console.log('Inserted initial data successfully');
    }

    await connection.end();
    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

createTables();
