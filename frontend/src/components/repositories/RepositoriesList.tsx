import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface Repository {
  id: string;
  name: string;
  createdAt: string;
  thumbnailPath: string;
  slideCount: number;
}

interface RepositoriesListProps {
  onSelectRepo: (repo: Repository) => void;
}

const dummyThumbnailPath = "https://i0.wp.com/www.bishoprook.com/wp-content/uploads/2021/05/placeholder-image-gray-16x9-1.png?fit=640%2C360&ssl=1";

export const RepositoriesList = ({ onSelectRepo }: RepositoriesListProps) => {
    // Sample repositories data
    const repositories = [
      {
        id: "repo1",
        name: "Q1 Sales Presentations",
        createdAt: "2025-01-15T10:30:00Z",
        thumbnailPath: dummyThumbnailPath,
        slideCount: 24
      },
      {
        id: "repo2",
        name: "Product Launch Materials",
        createdAt: "2025-02-03T14:15:00Z",
        thumbnailPath: dummyThumbnailPath,
        slideCount: 18
      },
      {
        id: "repo3",
        name: "Executive Briefings",
        createdAt: "2025-02-20T09:45:00Z",
        thumbnailPath: dummyThumbnailPath,
        slideCount: 12
      },
      {
        id: "repo4",
        name: "Client Onboarding",
        createdAt: "2025-01-28T11:20:00Z",
        thumbnailPath: dummyThumbnailPath,
        slideCount: 15
      },
      {
        id: "repo5",
        name: "Conference Materials",
        createdAt: "2025-01-10T16:00:00Z",
        thumbnailPath: dummyThumbnailPath,
        slideCount: 30
      },
      {
        id: "repo6",
        name: "Training Workshops",
        createdAt: "2025-02-12T13:30:00Z",
        thumbnailPath: dummyThumbnailPath,
        slideCount: 42
      }
    ];
  
    // Format date to a more readable format
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {repositories.map((repo) => (
          <Card 
            key={repo.id} 
            className="cursor-pointer transition-all hover:shadow-md overflow-hidden"
            onClick={() => onSelectRepo(repo)}
          >
            <div className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%" }}> {/* 56.25% = 9/16 = 16:9 ratio */}
              <img 
                src={repo.thumbnailPath} 
                alt={repo.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-4">
              <h3 className="font-medium text-lg mb-1">{repo.name}</h3>
              <div className="flex justify-between text-sm text-gray-500">
                <p>Created: {formatDate(repo.createdAt)}</p>
                <p>{repo.slideCount} slides</p>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    );
  };