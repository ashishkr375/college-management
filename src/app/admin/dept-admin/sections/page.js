'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SectionManagementPage() {
  const { data: session } = useSession();
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sectionName, setSectionName] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchInitialData();
    }
  }, [session]);

  async function fetchInitialData() {
    try {
      const [programmesRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/dept/programmes'),
        fetch('/api/admin/dept/sections/all')
      ]);

      const [programmesData, sectionsData] = await Promise.all([
        programmesRes.json(),
        sectionsRes.json()
      ]);

      setProgrammes(programmesData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function fetchBatches(programmeId) {
    try {
      const response = await fetch(`/api/admin/dept/batches?programmeId=${programmeId}`);
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  }

  async function handleProgrammeChange(e) {
    const programmeId = e.target.value;
    setSelectedProgramme(programmeId);
    setSelectedBatch('');
    if (programmeId) {
      await fetchBatches(programmeId);
    } else {
      setBatches([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/dept/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: selectedBatch,
          sectionName: sectionName.toUpperCase()
        }),
      });

      if (response.ok) {
        alert('Section created successfully');
        fetchInitialData();
        // Reset form
        setSectionName('');
      } else {
        const data = await response.json();
        alert(data.error || 'Error creating section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Error creating section');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(sectionId) {
    if (!confirm('Are you sure you want to delete this section? This will also delete all related data.')) return;

    try {
      const response = await fetch(`/api/admin/dept/sections/${sectionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Section deleted successfully');
        fetchInitialData();
      } else {
        const data = await response.json();
        alert(data.error || 'Error deleting section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Section Management</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1">Programme</label>
            <select
              value={selectedProgramme}
              onChange={handleProgrammeChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Programme</option>
              {programmes.map((prog) => (
                <option key={prog.programme_id} value={prog.programme_id}>
                  {prog.programme_name} ({prog.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full p-2 border rounded"
              required
              disabled={!selectedProgramme}
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Section Name</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., A, B, C"
              className="w-full p-2 border rounded"
              required
              maxLength={2}
              pattern="[A-Za-z]"
              title="Single letter section name"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Creating...' : 'Create Section'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Programme</th>
              <th className="px-4 py-2 border">Batch</th>
              <th className="px-4 py-2 border">Section</th>
              <th className="px-4 py-2 border">Students</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.section_id}>
                <td className="px-4 py-2 border">
                  {section.programme_name} ({section.level})
                </td>
                <td className="px-4 py-2 border">{section.batch_year}</td>
                <td className="px-4 py-2 border">{section.section_name}</td>
                <td className="px-4 py-2 border">{section.student_count}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(section.section_id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 