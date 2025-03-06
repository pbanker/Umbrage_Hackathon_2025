import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCompletions, PresentationInput } from "@/hooks/useCompletions";
import { useRepositories } from "@/hooks/useRepositories";

export const GeneratePresentationView = () => {
    const { generatePresentation, isGenerating } = useCompletions({
        onSuccess: () => {
            setFormData({
                repository_id: '',
                title: '',
                client_name: '',
                industry: '',
                description: '',
                target_audience: '',
                key_messages: [''],
                num_slides: 5,
                preferred_slide_types: [],
                tone: '',
                additional_context: '',
                sales_stage: ''
            });
        }
    });
    const { repositories } = useRepositories();
    const [messageIndex, setMessageIndex] = useState(0);

    const [formData, setFormData] = useState<PresentationInput>({
      repository_id: '',
      title: '',
      client_name: '',
      industry: '',
      description: '',
      target_audience: '',
      key_messages: [''],
      num_slides: 5,
      preferred_slide_types: [],
      tone: '',
      additional_context: '',
      sales_stage: ''
    });
    
    const [loadingMessage, setLoadingMessage] = useState('');
    
    const loadingMessages = [
      "Brewing coffee for the algorithm...",
      "Generating impressive-looking numbers...",
      "Infusing slides with buzzwords...",
      "Teaching AI the art of persuasion...",
      "Polishing virtual slides...",
      "Negotiating with pixels...",
      "Generating corporate jargon...",
      "Adding strategic clipart...",
      "Teaching AI to avoid comic sans...",
      "Giving PowerPoint a pep talk...",
      "Sprinkling in AI magic...",
      "Coaching neural networks on elevator pitches...",
      "Making data look important...",
      "Practicing AI handshakes...",
      "Adding just the right amount of graph...",
      "Teaching AI to make eye contact...",
      "Finding the perfect stock photos...",
      "Rehearsing AI presentation skills...",
  ];
    
    // Handle form input changes
    const handleInputChange = (field: keyof PresentationInput, value: string | string[]) => {
      setFormData({
        ...formData,
        [field]: value
      });
    };
    
    // Handle key messages changes
    const handleKeyMessageChange = (index: number, value: string) => {
      const updatedMessages = [...formData.key_messages];
      updatedMessages[index] = value;
      
      handleInputChange('key_messages', updatedMessages);
    };
    
    // Add a new key message field
    const addKeyMessage = () => {
      handleInputChange('key_messages', [...formData.key_messages, '']);
    };
    
    // Remove a key message field
    const removeKeyMessage = (index: number) => {
      if (formData.key_messages.length > 1) {
        const updatedMessages = formData.key_messages.filter((_, i) => i !== index);
        handleInputChange('key_messages', updatedMessages);
      }
    };
    
    // Handle slide type selection
    const handleSlideTypeChange = (type: string) => {
      const updatedTypes = [...(formData.preferred_slide_types || [])];
      
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

    useEffect(() => {
      let messageInterval: NodeJS.Timeout;
      
      if (isGenerating) {
          // Start with initial message
          setLoadingMessage(loadingMessages[messageIndex]);
          
          messageInterval = setInterval(() => {
              setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
              setLoadingMessage(loadingMessages[messageIndex]);
          }, 2000);
      } else {
          setLoadingMessage('');
          setMessageIndex(0); // Reset message index when not generating
      }

      return () => {
          if (messageInterval) {
              clearInterval(messageInterval);
          }
      };
    }, [isGenerating, messageIndex]);
    
    const slideTypes = [
      "Intro", "About", "Process", "Timeline", "Case Study",
      "Product Roadmap", "Product Definition", "Our Methodology", "Development", "Team", "Strategy", "Capabilities", "Conclusion", "Call to Action", 
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
      "Technology", "Oil & Gas", "Healthcare", "Finance", "Education",
      "Retail", "Manufacturing", "Media", "Consulting", "Other"
    ];

    const salesStageOptions = [
      "Discovery",
      "Qualification",
      "Solution Development",
      "Proposal",
      "Negotiation",
      "Closing",
      "Post-Sale"
    ];
  
    return (
      <CardContent className="px-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-2xl font-semibold tracking-tight">Generate AI Presentation</CardTitle>
        </CardHeader>
        
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin h-40 w-40" color="gray" strokeWidth={1}/>
              <span className="text-gray-800 text-xl mb-2">Generating your presentation</span>
            </div>
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
                  placeholder="e.g., Sales Slides Repository"
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
            
            <div className="grid grid-cols-4 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="sales_stage">Sales Stage</Label>
                <Select 
                  value={formData.sales_stage} 
                  onValueChange={(value) => handleInputChange('sales_stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesStageOptions.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            
            <div className="space-y-2">
              <Label>Preferred Slide Types</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {slideTypes.map((type) => (
                  <Button
                    key={type}
                    variant={(formData.preferred_slide_types ?? []).includes(type) ? "default" : "outline"}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repository_id">Repository</Label>
                <Select 
                value={formData.repository_id} 
                onValueChange={(value) => handleInputChange('repository_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories?.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>{repo.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="num_slides">Number of Slides</Label>
                <Input
                  id="num_slides"
                  type="number"
                  value={formData.num_slides}
                  onChange={(e) => handleInputChange('num_slides', e.target.value || "1")}
                  min="1"
                  max="20"
                  className="w-24"
                />
              </div>
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => generatePresentation(formData)}
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