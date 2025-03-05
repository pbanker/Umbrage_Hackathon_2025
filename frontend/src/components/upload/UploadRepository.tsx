import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const UploadRepository = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repositoryName, setRepositoryName] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    setError(null);
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pptx')) {
      setError('Only PPTX files are accepted');
      return;
    }

    setFile(selectedFile);
  };

  return (
    <CardContent className="px-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Upload Repository</CardTitle>
      </CardHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="repositoryName">Repository Name</Label>
          <Input
            id="repositoryName"
            value={repositoryName}
            onChange={(e) => setRepositoryName(e.target.value)}
            placeholder="Enter repository name"
          />
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-gray-500">
              {file ? (
                <p>Selected file: {file.name}</p>
              ) : (
                <p>Drag and drop your PPTX file here</p>
              )}
            </div>
            <Button variant="outline" onClick={() => document.getElementById('fileInput')?.click()}>
              Browse Files
            </Button>
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept=".pptx"
              onChange={(e) => validateAndSetFile(e.target.files?.[0])}
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <Button 
          className="w-full" 
          disabled={!file || !repositoryName}
        >
          Upload Repository
        </Button>
      </div>
    </CardContent>
  );
}; 