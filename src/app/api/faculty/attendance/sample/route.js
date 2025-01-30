import { executeQuery } from '@/lib/db';

export async function GET(request) {
  try {
    // Generate sample Indian names
    const sampleNames = [
      "Aarav Kumar", "Aditi Sharma", "Arjun Patel", "Diya Singh",
      "Ishaan Mehta", "Kavya Gupta", "Krishna Reddy", "Neha Verma",
      "Pranav Iyer", "Riya Desai", "Rohan Malhotra", "Sanya Joshi",
      // Add more names...
    ];

    const currentDate = new Date().toISOString().split('T')[0];
    const sampleData = [['roll_number', 'date', 'status']];

    // Generate 34 sample records
    for (let i = 1; i <= 34; i++) {
      const rollNumber = `2022CSB${String(i).padStart(3, '0')}`;
      const name = sampleNames[(i - 1) % sampleNames.length];
      const status = 'Present'; // Default status
      sampleData.push([rollNumber, currentDate, status]);
    }

    const csvContent = sampleData.map(row => row.join(',')).join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=attendance_sample.csv'
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 