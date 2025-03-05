import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  numSlides: number;
  tone: string;
}

export const GeneratePresentation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    numSlides: 5,
    tone: ''
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    // Add your API call here
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <CardContent className="px-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Generate Presentation</CardTitle>
      </CardHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Presentation Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="tone">Tone</Label>
          <Select 
            value={formData.tone}
            onValueChange={(value) => setFormData({ ...formData, tone: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Presentation'
          )}
        </Button>
      </div>
    </CardContent>
  );
}; 