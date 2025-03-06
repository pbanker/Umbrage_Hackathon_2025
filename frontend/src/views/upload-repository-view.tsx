import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRepositories } from "@/hooks/useRepositories";
import { Loader2 } from "lucide-react";

export const UploadRepositoryView = () => {
    const { uploadRepository, isUploading } = useRepositories({
        onSuccess: () => {
            setFile(null);
            setRepositoryName("");
        }
    });
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [repositoryName, setRepositoryName] = useState<string>("");
    
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
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        validateAndSetFile(selectedFile);
      }
    };
    
    const validateAndSetFile = (selectedFile: File) => {
      setError(null);
      
      if (!selectedFile) return;
      
      // Check file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'pptx') {
        setError('Only PPTX files are accepted.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    };

    const handleUploadRepository = async () => {
      if (file) {
        await uploadRepository({ file, title: repositoryName });
      }
    };
  
    return (
      <CardContent className="px-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-2xl font-semibold tracking-tight">Upload Slide Repository</CardTitle>
        </CardHeader>
                  
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-4 mx-auto h-[500px]">
              <Loader2 className="animate-spin h-40 w-40" color="gray" strokeWidth={1}/>
              <span className="text-gray-600 text-xl mb-2">Uploading repository...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="repositoryName">Repository Name</Label>
                <Input
                  id="repositoryName"
                  placeholder="e.g., Sales Slides Repository"
                  value={repositoryName}
                  onChange={(e) => setRepositoryName(e.target.value)}
                />
              </div>
              <div 
                className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${error ? 'border-red-500' : ''} border-dashed rounded-lg p-8 text-center transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  
                  {file ? (
                    <div className="text-sm font-medium text-green-600">
                      {file.name} (Ready to upload)
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">Drag and drop your PPTX file here</p>
                      <p className="text-xs text-gray-500">Or</p>
                      <div className="relative">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pptx"
                          onChange={handleFileChange}
                        />
                        <Button variant="outline" className="relative pointer-events-none">
                          Browse Files
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Only PPTX files are accepted</p>
                    </>
                  )}
                  
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {file && !isUploading && (
            <div className="mt-4">
              <Button disabled={!file || isUploading} onClick={handleUploadRepository}>
                {isUploading ? 'Uploading...' : 'Upload Repository'}
              </Button>
            </div>
          )}
      </CardContent>
    );
  };