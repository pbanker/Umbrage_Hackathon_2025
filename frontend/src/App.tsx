import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* App header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Presentation Generator POC</h1>
        <p className="text-gray-500 mt-1">Generate slide presentations with AI</p>
      </header>

      {/* Main content container */}
      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 border border-gray-200 shadow-sm rounded-md py-0.5">
          <TabsTrigger 
            value="metadata" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm my-0.5"
          >
            Slide Metadata
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm my-0.5"
          >
            Upload Repository
          </TabsTrigger>
          <TabsTrigger 
            value="generate" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm my-0.5"
          >
            Generate Presentation
          </TabsTrigger>
        </TabsList>

        <Card>
          <TabsContent value="metadata" className="mt-0">
            <SlideMetadataView />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-0">
            <UploadRepository />
          </TabsContent>
          
          <TabsContent value="generate" className="mt-0">
            <GeneratePresentation />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

const dummyThumbnailPath = "https://i0.wp.com/www.bishoprook.com/wp-content/uploads/2021/05/placeholder-image-gray-16x9-1.png?fit=640%2C360&ssl=1";

const RepositoriesList = ({ onSelectRepo }) => {
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
  const formatDate = (dateString) => {
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

const SlideMetadataView = () => {
  const [selectedRepo, setSelectedRepo] = useState(null);
  
  const handleBackToRepos = () => {
    setSelectedRepo(null);
  };
  
  return (
    <div>
      {selectedRepo ? (
        <SlideThumbnailList repository={selectedRepo} onBack={handleBackToRepos} />
      ) : (
        <RepositoriesList onSelectRepo={setSelectedRepo} />
      )}
    </div>
  );
};

const SlideThumbnailList = ({ repository, onBack }) => {
  // Sample data (would come from props in real implementation)
  const [slides, setSlides] = useState([
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

  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetaData, setEditedMetaData] = useState(null);

  // Handle slide selection
  const handleSelectSlide = (slide) => {
    setSelectedSlide(slide);
    setEditedMetaData(null);
    setIsEditing(false);
  };

  // Handle metadata field change
  const handleMetaDataChange = (field, value) => {
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

const UploadRepository = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };
  
  const validateAndSetFile = (selectedFile) => {
    setError(null);
    
    if (!selectedFile) return;
    
    // Check file extension
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'pptx') {
      setError('Only PPTX files are accepted.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  return (
    <CardContent className="px-6">
      <CardHeader className="px-0 pt-0 mb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">Upload Slide Repository</CardTitle>
      </CardHeader>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="repositoryName">Repository Name</Label>
          <Input
            id="repositoryName"
            placeholder="e.g., Q1 Sales Presentations"
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
        
        <div className="mt-4">
          <Button disabled={!file}>
            Upload Repository
          </Button>
        </div>
      </div>
    </CardContent>
  );
};

const GeneratePresentation = () => {
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    industry: '',
    description: '',
    target_audience: '',
    key_messages: [''],
    num_slides: 5,
    preferred_slide_types: [],
    tone: '',
    additional_context: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const loadingMessages = [
    "Training robots to talk business...",
    "Convincing algorithms to wear a tie...",
    "Extracting buzzwords from the cloud...",
    "Teaching AI the art of persuasion...",
    "Brewing coffee for the algorithm...",
    "Polishing virtual slides...",
    "Calculating optimal pizza charts...",
    "Negotiating with pixels...",
    "Generating corporate jargon...",
    "Adding strategic clipart..."
  ];
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle key messages changes
  const handleKeyMessageChange = (index, value) => {
    const updatedMessages = [...formData.key_messages];
    updatedMessages[index] = value;
    
    handleInputChange('key_messages', updatedMessages);
  };
  
  // Add a new key message field
  const addKeyMessage = () => {
    handleInputChange('key_messages', [...formData.key_messages, '']);
  };
  
  // Remove a key message field
  const removeKeyMessage = (index) => {
    if (formData.key_messages.length > 1) {
      const updatedMessages = formData.key_messages.filter((_, i) => i !== index);
      handleInputChange('key_messages', updatedMessages);
    }
  };
  
  // Handle slide type selection
  const handleSlideTypeChange = (type) => {
    const updatedTypes = [...formData.preferred_slide_types];
    
    if (updatedTypes.includes(type)) {
      // Remove if already exists
      const index = updatedTypes.indexOf(type);
      updatedTypes.splice(index, 1);
    } else {
      // Add if doesn't exist
      updatedTypes.push(type);
    }
    
    handleInputChange('preferred_slide_types', updatedTypes);
  };
  
  // Generate presentation
  const generatePresentation = () => {
    setIsLoading(true);
    
    // Start cycling through loading messages
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000);
    
    // Simulate API call
    setTimeout(() => {
      clearInterval(messageInterval);
      setIsLoading(false);
      // Here you would normally handle the API response
    }, 8000);
  };
  
  const slideTypes = [
    "title", "agenda", "bullet-points", "comparison", "quote",
    "chart", "timeline", "image-focused", "team", "call-to-action"
  ];
  
  const toneOptions = [
    "professional", "conversational", "enthusiastic", "educational",
    "persuasive", "authoritative", "inspirational"
  ];
  
  const audienceOptions = [
    "Executive Team", "Sales Team", "Potential Clients",
    "Technical Team", "Investors", "General Public"
  ];
  
  const industryOptions = [
    "Technology", "Healthcare", "Finance", "Education",
    "Retail", "Manufacturing", "Media", "Consulting", "Other"
  ];

  return (
    <CardContent className="px-6">
      <CardHeader className="px-0 pt-0 mb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">Generate AI Presentation</CardTitle>
      </CardHeader>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Generating your presentation</p>
          <p className="text-gray-500">{loadingMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Presentation Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Q1 Sales Results"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                placeholder="e.g., Acme Corporation"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value) => handleInputChange('target_audience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((audience) => (
                    <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what you want in your presentation..."
              className="h-24"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Key Messages</Label>
            <div className="space-y-3">
              {formData.key_messages.map((message, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => handleKeyMessageChange(index, e.target.value)}
                    placeholder={`Key message ${index + 1}`}
                  />
                  {formData.key_messages.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeKeyMessage(index)}
                    >
                      <span className="sr-only">Remove</span>
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addKeyMessage}
              >
                + Add Key Message
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_slides">Number of Slides</Label>
              <Input
                id="num_slides"
                type="number"
                value={formData.num_slides}
                onChange={(e) => handleInputChange('num_slides', parseInt(e.target.value) || 1)}
                min="1"
                max="20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tone">Presentation Tone</Label>
              <Select 
                value={formData.tone} 
                onValueChange={(value) => handleInputChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferred Slide Types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {slideTypes.map((type) => (
                <Button
                  key={type}
                  variant={formData.preferred_slide_types.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSlideTypeChange(type)}
                  className="capitalize"
                >
                  {type.replace(/-/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional_context">Additional Context</Label>
            <Textarea
              id="additional_context"
              value={formData.additional_context}
              onChange={(e) => handleInputChange('additional_context', e.target.value)}
              placeholder="Any other information that might be helpful..."
              className="h-24"
            />
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={generatePresentation}
              className="w-full py-6 text-lg"
            >
              Generate Presentation
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  );
};

export default AppLayout;