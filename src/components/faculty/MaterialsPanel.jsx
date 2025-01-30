'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, Link as LinkIcon, Trash2 } from 'lucide-react';

const MATERIAL_TYPES = [
  'Syllabus',
  'Lecture Notes',
  'Assignment',
  'Reference Material',
  'Project Guide',
];

export default function MaterialsPanel({ courseId, facultyId }) {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materialType, setMaterialType] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId]);

  async function fetchMaterials() {
    try {
      const response = await fetch(`/api/faculty/materials?courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load materials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/faculty/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: materialType,
          description,
          fileUrl,
          courseId,
        }),
      });

      if (!response.ok) throw new Error('Failed to add material');

      toast({
        title: 'Success',
        description: 'Material added successfully',
      });

      // Reset form
      setMaterialType('');
      setDescription('');
      setFileUrl('');
      
      // Refresh materials list
      fetchMaterials();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add material',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(materialId) {
    try {
      const response = await fetch(`/api/faculty/materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete material');

      toast({
        title: 'Success',
        description: 'Material deleted successfully',
      });

      // Refresh materials list
      fetchMaterials();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete material',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          value={materialType}
          onValueChange={setMaterialType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Material Type" />
          </SelectTrigger>
          <SelectContent>
            {MATERIAL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          type="url"
          placeholder="File URL (Google Drive/OneDrive link)"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Material'
          )}
        </Button>
      </form>

      <div className="border rounded-md divide-y">
        {materials.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            No materials added yet
          </p>
        ) : (
          materials.map((material) => (
            <div
              key={material.material_id}
              className="p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <p className="font-medium">{material.type}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {material.description}
                </p>
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <LinkIcon className="h-3 w-3" />
                  Open Material
                </a>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(material.material_id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 