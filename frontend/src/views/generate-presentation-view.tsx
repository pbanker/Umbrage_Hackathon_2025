import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const GeneratePresentationView = () => {
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