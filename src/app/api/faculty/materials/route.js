import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { writeFile } from "fs/promises";
import path from 'path';
var fs = require('fs');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//     const uploadPath = req.query.destination || "./public";

//     console.log(uploadPath)

//      // Validate path is within allowed directories
     
//     // The below code is for authentication of the file upload
//     const allowedDirs = [
//         './public',
//         './uploads'
//     ];

//     console.log(allowedDirs);
//     console.log(allowedDirs.some(dir => uploadPath.startsWith(dir)));
    
    
//     if (!allowedDirs.some(dir => uploadPath.startsWith(dir))) {
//         return cb(new Error('Invalid destination path'));
//     }
    
//     // Create full directory structure if it doesn't exist
//     fs.mkdirSync(uploadPath, { recursive: true });

//       cb(null,uploadPath);
//     },
//     filename: function (req, file, cb) {
//         cb(null , file.originalname);
//     }
//   });

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Missing courseId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const materials = await executeQuery(`
      SELECT *
      FROM CourseMaterials
      WHERE course_id = ? AND faculty_id = ?
      ORDER BY upload_date DESC
    `, [courseId, session.user.id]);

    return new Response(JSON.stringify(materials), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'faculty') {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const { type, description, fileUrl, courseId } = await request.json();

//     // Validate URL
//     try {
//       new URL(fileUrl);
//     } catch (e) {
//       return new Response(JSON.stringify({ error: 'Invalid file URL' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const result = await executeQuery(`
//       INSERT INTO CourseMaterials (
//         type,
//         description,
//         file_url,
//         faculty_id,
//         course_id
//       ) VALUES (?, ?, ?, ?, ?)
//     `, [type, description, fileUrl, session.user.id, courseId]);

//     return new Response(JSON.stringify({ 
//       message: 'Material added successfully',
//       id: result.insertId 
//     }), {
//       status: 201,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// } 

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const type = formData.get("type")
    const description = formData.get("description")
    const courseId = formData.get("courseId")

    if (!file) {
      return new Response(JSON.stringify({ error: "No files received." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename =  file.name.replaceAll(" ", "_");

    var dir = path.join(process.cwd(), `public/uploads/${session.user.id}/${courseId}/${type}/`)
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    await writeFile(
      path.join(process.cwd(), `public/uploads/${session.user.id}/${courseId}/${type}/` + filename),
      buffer
    );

    const result = await executeQuery(`
      INSERT INTO CourseMaterials (
        type,
        description,
        file_url,
        faculty_id,
        course_id
      ) VALUES (?, ?, ?, ?, ?)
    `, [type, description, dir + filename, session.user.id, courseId]);

    return new Response(JSON.stringify({ msg: "ok" }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}