import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Repository } from '../repositories/RepositoriesList';

interface Slide {
  id: string;
  imagePath: string;
  metaData: {
    title: string;
    category: string;
    slide_type: string;
    purpose: string;
    tags: string[];
    audience: string;
    sales_stage: string;
  };
}

interface SlideThumbnailListProps {
  repository: Repository;
  onBack: () => void;
}

const dummyThumbnailPath = "https://i0.wp.com/www.bishoprook.com/wp-content/uploads/2021/05/placeholder-image-gray-16x9-1.png?fit=640%2C360&ssl=1";

export const SlideThumbnailList = ({ repository, onBack }: SlideThumbnailListProps) => {
    // Sample data (would come from props in real implementation)
    const [slides, setSlides] = useState<Slide[]>([
      {
        id: "slide1",
        imagePath: dummyThumbnailPath,
        metaData: {
          title: "Project Timeline",
          category: "timelines",
          slide_type: "gantt-chart",
          purpose: "to show the timeline of the project",
          tags: ["timeline", "project", "schedule"],
          audience: "engineering team",
          sales_stage: "discovery"
        }
      },
      {
        id: "slide2",
        imagePath: dummyThumbnailPath,
        metaData: {
          title: "Feature Roadmap",
          category: "roadmaps",
          slide_type: "flowchart",
          purpose: "to outline upcoming feature releases",
          tags: ["roadmap", "features", "planning"],
          audience: "product team",
          sales_stage: "planning"
        }
      },
      {
        id: "slide3",
        imagePath: dummyThumbnailPath,
        metaData: {
          title: "Market Analysis",
          category: "analytics",
          slide_type: "bar-chart",
          purpose: "to analyze market trends",
          tags: ["market", "analysis", "trends"],
          audience: "executive team",
          sales_stage: "proposal"
        }
      },
      {
        id: "slide4",
        imagePath: dummyThumbnailPath,
        metaData: {
          title: "Budget Overview",
          category: "finance",
          slide_type: "pie-chart",
          purpose: "to present budget allocation",
          tags: ["budget", "finance", "allocation"],
          audience: "stakeholders",
          sales_stage: "negotiation"
        }
      },
      {
        id: "slide5",
        imagePath: dummyThumbnailPath,
        metaData: {
          title: "Team Structure",
          category: "organization",
          slide_type: "org-chart",
          purpose: "to visualize team hierarchy",
          tags: ["team", "structure", "organization"],
          audience: "new hires",
          sales_stage: "onboarding"
        }
      }
    ]);
  
    const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedMetaData, setEditedMetaData] = useState<Slide['metaData'] | null>(null);
  
    // Handle slide selection
    const handleSelectSlide = (slide: Slide) => {
      setSelectedSlide(slide);
      setEditedMetaData(null);
      setIsEditing(false);
    };
  
    // Handle metadata field change
    const handleMetaDataChange = (field: string, value: string) => {
      setIsEditing(true);
      setEditedMetaData({
        ...editedMetaData || selectedSlide.metaData,
        [field]: value
      });
    };
  
    // Handle tag input (comma-separated)
    const handleTagsChange = (tagsString) => {
      const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
      handleMetaDataChange('tags', tagsArray);
    };
  
    // Save metadata changes
    const handleSave = () => {
      const updatedSlides = slides.map(slide => 
        slide.id === selectedSlide.id ? 
          {...slide, metaData: editedMetaData} : 
          slide
      );
      setSlides(updatedSlides);
      setSelectedSlide({...selectedSlide, metaData: editedMetaData});
      setIsEditing(false);
      setEditedMetaData(null);
    };
  
    // Cancel metadata changes
    const handleCancel = () => {
      setIsEditing(false);
      setEditedMetaData(null);
    };
  
    return (
      <div className="flex flex-col h-screen max-h-[80vh]">
        {/* Back button and repository info */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
              <span className="sr-only">Back</span>
            </Button>
            <h2 className="text-xl font-semibold tracking-tight">{repository.name}</h2>
          </div>
          <div className="text-sm text-gray-500">
            {repository.slideCount} slides
          </div>
        </div>
  
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Scrollable thumbnails list */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold tracking-tight">Slide Thumbnails</CardTitle>
            </CardHeader>
            <div className="space-y-4 mt-2">
              {slides.map((slide) => (
                <div 
                  key={slide.id}
                  className={`relative cursor-pointer border-2 rounded-md overflow-hidden ${selectedSlide?.id === slide.id ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => handleSelectSlide(slide)}
                >
                  <img 
                    src={slide.imagePath} 
                    alt={slide.metaData.title}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white text-black p-2">
                    <p className="text-black text-sm font-semibold truncate">{slide.metaData.title}</p>
                    <p className="text-gray-800 text-xs">ID: {slide.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Right panel - Metadata form */}
          <div className="w-2/3 bg-gray-50 p-6">
            {selectedSlide ? (
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editedMetaData?.title || selectedSlide.metaData.title}
                        onChange={(e) => handleMetaDataChange('title', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editedMetaData?.category || selectedSlide.metaData.category}
                        onChange={(e) => handleMetaDataChange('category', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slideType">Slide Type</Label>
                      <Input
                        id="slideType"
                        value={editedMetaData?.slide_type || selectedSlide.metaData.slide_type}
                        onChange={(e) => handleMetaDataChange('slide_type', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        value={editedMetaData?.purpose || selectedSlide.metaData.purpose}
                        onChange={(e) => handleMetaDataChange('purpose', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={(editedMetaData?.tags || selectedSlide.metaData.tags).join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="audience">Audience</Label>
                      <Input
                        id="audience"
                        value={editedMetaData?.audience || selectedSlide.metaData.audience}
                        onChange={(e) => handleMetaDataChange('audience', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salesStage">Sales Stage</Label>
                      <Input
                        id="salesStage"
                        value={editedMetaData?.sales_stage || selectedSlide.metaData.sales_stage}
                        onChange={(e) => handleMetaDataChange('sales_stage', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="mt-6 flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a slide to view and edit metadata</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};