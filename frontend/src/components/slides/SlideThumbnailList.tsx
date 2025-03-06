import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PresentationMetadata } from '@/hooks/useRepositories';
import { useSlides, SlideMetadata } from '@/hooks/useSlides';
import { serverUrl } from '@/const';

interface SlideThumbnailListProps {
  repository: PresentationMetadata;
  onBack: () => void;
}

export const SlideThumbnailList = ({ repository, onBack }: SlideThumbnailListProps) => {
  const { slides, updateSlideMetadata } = useSlides(repository.id);
  
    const [selectedSlide, setSelectedSlide] = useState<SlideMetadata | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedMetaData, setEditedMetaData] = useState<Omit<SlideMetadata, 'id' | 'image_path'> | null>(null);
  
    // Handle slide selection
    const handleSelectSlide = (slide: SlideMetadata) => {
      setSelectedSlide(slide);
      setEditedMetaData(null);
      setIsEditing(false);
    };
  
    // Handle metadata field change
    const handleMetaDataChange = (field: string, value: string) => {
      setIsEditing(true);
      if (selectedSlide) {
        const { id, image_path, ...metadata } = selectedSlide;
        setEditedMetaData({
          ...editedMetaData || metadata,
          [field]: value
        });
      }
    };
  
    // Handle tag input (comma-separated)
    const handleTagsChange = (tagsString: string) => {
      const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
      handleMetaDataChange('tags', tagsArray.join(','));
    };
  
    // Save metadata changes
    const handleSave = () => {
      if (selectedSlide && editedMetaData) {
        updateSlideMetadata({
          slideId: selectedSlide.id,
          metadata: editedMetaData
        });
        setSelectedSlide({...selectedSlide, ...editedMetaData});
        setIsEditing(false);
        setEditedMetaData(null);
      }
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
            <h2 className="text-xl font-semibold tracking-tight">{repository.title}</h2>
          </div>
          <div className="text-sm text-gray-500">
            {repository.number_of_slides} slides
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
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`relative cursor-pointer border-2 rounded-md overflow-hidden ${selectedSlide?.id === slide.id ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => handleSelectSlide(slide)}
                >
                  <img 
                    src={`${serverUrl}/${slide.image_path}`} 
                    alt={slide.title}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white text-black p-2">
                    <p className="text-black text-sm font-semibold truncate">{slide.title}</p>
                    <p className="text-gray-800 text-xs">{index + 1} of {repository.number_of_slides}</p>
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
                        value={editedMetaData?.title || selectedSlide.title}
                        onChange={(e) => handleMetaDataChange('title', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editedMetaData?.category || selectedSlide.category}
                        onChange={(e) => handleMetaDataChange('category', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slideType">Slide Type</Label>
                      <Input
                        id="slideType"
                        value={editedMetaData?.slide_type || selectedSlide.slide_type}
                        onChange={(e) => handleMetaDataChange('slide_type', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        value={editedMetaData?.purpose || selectedSlide.purpose}
                        onChange={(e) => handleMetaDataChange('purpose', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={editedMetaData?.tags?.toString() || selectedSlide?.tags?.toString() || ''}
                        onChange={(e) => handleTagsChange(e.target.value)}
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