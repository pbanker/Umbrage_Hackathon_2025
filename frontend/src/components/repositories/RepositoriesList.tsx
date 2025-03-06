import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PresentationMetadata } from '@/hooks/useRepositories';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { serverUrl } from '@/const';

type Tab = "metadata" | "upload" | "generate";

interface RepositoriesListProps {
  onSelectRepo: (repo: PresentationMetadata) => void;
  repositories: PresentationMetadata[];
  isLoadingRepositories: boolean;
  errorRepositories: Error | null;
  setSelectedTab: (tab: Tab) => void;
}

export const RepositoriesList = ({ onSelectRepo, isLoadingRepositories, repositories, setSelectedTab }: RepositoriesListProps) => {
  
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };
  
    return (
      <div className="px-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold tracking-tight">Slide Repositories</CardTitle>
          <CardDescription>Select a repository to edit metadata</CardDescription>
        </CardHeader>
        
        {isLoadingRepositories ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin h-40 w-40" color="gray" strokeWidth={1}/>
              <span className="text-gray-500 text-lg">Fetching repositories...</span>
            </div>
          </div>
        ) : (
          repositories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {repositories.map((repo) => (
                <Card 
                key={repo.id} 
                className="cursor-pointer transition-all hover:shadow-md overflow-hidden"
                onClick={() => onSelectRepo(repo)}
              >
                <div className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%" }}> {/* 56.25% = 9/16 = 16:9 ratio */}
                  <img 
                    src={`${serverUrl}/${repo.image_path}`} 
                    alt={repo.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium text-lg mb-1">{repo.title}</h3>
                  <div className="flex justify-between text-sm text-gray-500">
                    <p>Created: {formatDate(repo.created_at)}</p>
                    <p>{repo.number_of_slides} slides</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col gap-4 justify-center items-center h-full">
              <p className="text-gray-500">No repositories found</p>
              <Button onClick={() => setSelectedTab("upload")}>Create Repository</Button>
            </div>
          </div>
        ))}
      </div>
    );
  };