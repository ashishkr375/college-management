'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function MaterialsPage({ params }) {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('Syllabus');

  const materialTypes = [
    'Syllabus',
    'Question',
    'Answer Key',
    'Assignment',
    'Lab Manual',
    'Other'
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchMaterials();
    }
  }, [session]);

  async function fetchMaterials() {
    try {
      const response = await fetch(`/api/faculty/materials?courseId=${params.courseId}`);
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', materialType);
    formData.append('description', description);
    formData.append('courseId', params.courseId);

    try {
      const response = await fetch('/api/faculty/materials', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Material uploaded successfully');
        setSelectedFile(null);
        setDescription('');
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Error uploading material');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(materialId) {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await fetch(`/api/faculty/materials/${materialId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Material deleted successfully');
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error deleting material');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Course Materials</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="grid gap-4">
          <div>
            <label className="block mb-1">Material Type</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {materialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 bg-black text-white rounded hover:bg-white hover:text-black hover:border-black hover:border-2 disabled:bg-gray-400"
          >
            {isUploading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {materials.map((material) => (
          <div key={material.material_id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{material.type}</h3>
              <p className="text-gray-600">{material.description}</p>
              <p className="text-sm text-gray-500">
                Uploaded on: {new Date(material.upload_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                View
              </a>
              <button
                onClick={() => handleDelete(material.material_id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 