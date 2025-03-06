import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlideMetadataView } from './views/slide-metadata-view';
import { UploadRepositoryView } from './views/upload-repository-view';
import { GeneratePresentationView } from './views/generate-presentation-view';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react';

type Tab = "metadata" | "upload" | "generate";

const App = () => {
  const queryClient = new QueryClient()
  const [selectedTab, setSelectedTab] = useState<Tab>("metadata");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-100 p-6">
        {/* App header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Presentation Generator POC</h1>
        <p className="text-gray-500 mt-1">Generate slide presentations with AI</p>
      </header>

      {/* Main content container */}
      <Tabs 
        value={selectedTab} 
        onValueChange={(value: string) => setSelectedTab(value as Tab)}
      >
        <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 border border-gray-200 shadow-sm rounded-md py-0.5">
          <TabsTrigger 
            value="metadata" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hover:cursor-pointer data-[state=active]:hover:cursor-default"
          >
            Edit Metadata
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hover:cursor-pointer data-[state=active]:hover:cursor-default"
          >
            Upload Repository
          </TabsTrigger>
          <TabsTrigger 
            value="generate" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hover:cursor-pointer data-[state=active]:hover:cursor-default"
          >
            Generate Presentation
          </TabsTrigger>
        </TabsList>

        <Card className="min-h-[500px]">
          <TabsContent value="metadata">
            <SlideMetadataView setSelectedTab={setSelectedTab} />
          </TabsContent>
          
          <TabsContent value="upload" >
            <UploadRepositoryView />
          </TabsContent>
          
          <TabsContent value="generate" >
            <GeneratePresentationView />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
    </QueryClientProvider>
  );
};

export default App;