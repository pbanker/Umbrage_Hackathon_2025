import { useState } from 'react';
import { RepositoriesList, Repository } from '../repositories/RepositoriesList';
import { SlideThumbnailList } from '../slides/SlideThumbnailList';

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