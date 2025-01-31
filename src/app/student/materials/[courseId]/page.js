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
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar,
  BookOpen,
  FileSpreadsheet,
  FileQuestion
} from 'lucide-react';
import { format } from 'date-fns';

export default function CourseMaterials() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  const materialTypes = [
    'all',
    'Syllabus',
    'Assignment',
    'Notes',
    'Reference'
  ];

  const typeIcons = {
    'Syllabus': <BookOpen className="h-5 w-5" />,
    'Assignment': <FileSpreadsheet className="h-5 w-5" />,
    'Notes': <FileText className="h-5 w-5" />,
    'Reference': <FileQuestion className="h-5 w-5" />
  };

  useEffect(() => {
    if (session?.user) {
      fetchMaterials();
      fetchCourseInfo();
    }
  }, [session]);

  async function fetchMaterials() {
    try {
      const response = await fetch(`/api/student/materials?courseId=${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      
      // Group materials by type
      const grouped = data.reduce((acc, material) => {
        if (!acc[material.type]) {
          acc[material.type] = [];
        }
        acc[material.type].push(material);
        return acc;
      }, {});

      // Sort materials in each group by date
      Object.keys(grouped).forEach(type => {
        grouped[type].sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
      });

      setMaterials(grouped);
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

  async function fetchCourseInfo() {
    try {
      const response = await fetch(`/api/student/courses/${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course info');
      const data = await response.json();
      setCourseInfo(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const filteredMaterials = selectedType === 'all' 
    ? materials 
    : { [selectedType]: materials[selectedType] || [] };

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
        <div>
          <h1 className="text-3xl font-bold">Course Materials</h1>
          {courseInfo && (
            <p className="text-muted-foreground">
              {courseInfo.course_name} ({courseInfo.course_code})
            </p>
          )}
        </div>
        
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

      <div className="space-y-8">
        {Object.entries(filteredMaterials).map(([type, items]) => (
          <div key={type} className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {typeIcons[type]}
              {type}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((material) => (
                <Card key={material.material_id} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{material.description}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(material.upload_date), 'PPP')}
                      </p>
                    </div>

                    <div className="flex justify-end">
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
          </div>
        ))}

        {Object.keys(filteredMaterials).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No materials found for the selected type.
          </div>
        )}
      </div>
    </div>
  );
} 