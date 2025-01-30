'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, Download, ExternalLink } from 'lucide-react';

export default function CourseMaterials() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  const materialTypes = [
    'all',
    'Syllabus',
    'Assignment',
    'Notes',
    'Reference'
  ];

  useEffect(() => {
    if (session?.user) {
      fetchMaterials();
    }
  }, [session]);

  async function fetchMaterials() {
    try {
      const response = await fetch(`/api/student/materials?courseId=${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load course materials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredMaterials = selectedType === 'all' 
    ? materials 
    : materials.filter(m => m.type === selectedType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Materials</h1>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {materialTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.material_id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-semibold">{material.description}</h3>
                  <p className="text-sm text-muted-foreground">{material.type}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {material.file_url.startsWith('http') ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(material.file_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Link
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = material.file_url}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No materials found for the selected type.
        </div>
      )}
    </div>
  );
} 