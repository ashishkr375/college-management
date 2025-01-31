# How to Use the Student Management System

## Setup Instructions

### Prerequisites

1. Node.js (v16+)
2. MySQL (v8+)
3. npm or yarn
4. Git

### Initial Setup

1. **Clone and Install**

```bash
# Clone the repository
git clone [repository-url]
cd student-management-system

# Install dependencies
npm install
```

2. **Environment Configuration**

```bash
# Copy example environment file
cp .env.example .env

# Configure your .env file with:
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=college_portal
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

3. **Database Setup**

```bash
# Run database initialization script
node script.js
```

4. **Start Development Server**

```bash
npm run dev
```

## User Guides

### For Students

1. **Accessing the System**

   - Navigate to the login page
   - Sign in with Google account
   - System will redirect to student dashboard

2. **Dashboard Features**

   - View all enrolled courses
   - Check attendance percentages
   - See recent marks/grades
   - Access course materials
   - Track academic progress

3. **Attendance Viewing**

   - Click on any course card
   - Navigate to attendance section
   - Filter by date range
   - View attendance statistics
   - Download attendance reports

4. **Accessing Course Materials**

   - Select desired course
   - Go to materials section
   - Filter by material type
   - Download available resources
   - Track new uploads

5. **Checking Marks**
   - Access marks section
   - View assessment-wise scores
   - Check total grades
   - Monitor performance trends

### For Faculty

1. **Course Management**

   - View assigned courses
   - Manage course materials
   - Track student progress
   - Generate reports

2. **Attendance Management**

   - Take daily attendance
   - Mark bulk attendance
   - Upload attendance CSV
   - Generate attendance reports
   - Monitor attendance trends

3. **Marks Management**

   - Enter student marks
   - Upload marks through CSV
   - Edit existing marks
   - Calculate final grades
   - Generate performance reports

4. **Material Management**
   - Upload course materials
   - Organize by categories
   - Update existing materials
   - Track student access
   - Manage resource versions

### For Department Admins

1. **Department Setup**

   - Manage faculty accounts
   - Create/edit courses
   - Assign faculty to courses
   - Monitor department performance

2. **Student Management**

   - Add new students
   - Manage student sections
   - Handle student transfers
   - Update student information

3. **Course Administration**
   - Create new courses
   - Assign faculty
   - Manage course schedules
   - Monitor course progress

### For Super Admins

1. **System Management**

   - Manage departments
   - Create admin accounts
   - Monitor system usage
   - Handle system configurations

2. **User Management**
   - Create/edit user accounts
   - Manage roles and permissions
   - Handle account issues
   - Monitor user activities

## Troubleshooting

### Common Issues

1. **Login Problems**

   - Clear browser cache
   - Check email verification
   - Verify role assignments
   - Contact admin if persistent

2. **Data Not Loading**

   - Check internet connection
   - Refresh the page
   - Clear browser cache
   - Check console for errors

3. **Upload Issues**

   - Verify file size (max 5MB)
   - Check file format
   - Ensure stable connection
   - Try compressing files

4. **Performance Issues**
   - Clear browser cache
   - Use latest browsers
   - Check internet speed
   - Report persistent issues

### Support Contacts

1. **Technical Support**

   - Email: support@example.com
   - Phone: +1234567890
   - Hours: 9 AM - 5 PM (Mon-Fri)

2. **Emergency Contact**
   - System Admin: admin@example.com
   - Emergency Phone: +1234567890

## Best Practices

1. **Data Entry**

   - Regular backups
   - Verify before submission
   - Follow naming conventions
   - Use prescribed formats

2. **File Management**

   - Organize materials properly
   - Use clear file names
   - Regular cleanup
   - Maintain versions

3. **Security**
   - Regular password updates
   - Secure login credentials
   - Log out after sessions
   - Report suspicious activity
