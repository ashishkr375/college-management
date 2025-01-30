const { google } = require('googleapis');

// Initialize Google Drive client with service account
const drive = google.drive({
  version: 'v3',
  auth: new google.auth.GoogleServiceAccount({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file']
  })
});

// Parent folder ID where all materials will be stored
const MATERIALS_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

async function uploadFile(file, fileName, mimeType) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [MATERIALS_FOLDER_ID]
    };

    const media = {
      mimeType: mimeType,
      body: file
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink
    };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw new Error('File upload failed');
  }
}

async function deleteFile(fileId) {
  try {
    await drive.files.delete({
      fileId: fileId
    });
    return true;
  } catch (error) {
    console.error('Google Drive delete error:', error);
    throw new Error('File deletion failed');
  }
}

module.exports = {
  uploadFile,
  deleteFile
}; 