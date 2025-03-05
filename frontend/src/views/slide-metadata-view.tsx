import { useState } from "react";
import { RepositoriesList, Repository } from "@/components/repositories/RepositoriesList";
import { SlideThumbnailList } from "@/components/slides/SlideThumbnailList";

export const SlideMetadataView = () => {
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    
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