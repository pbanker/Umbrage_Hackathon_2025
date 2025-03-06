import { useState } from "react";
import { RepositoriesList } from "@/components/repositories/RepositoriesList";
import { SlideThumbnailList } from "@/components/slides/SlideThumbnailList";
import { useRepositories, PresentationMetadata } from "@/hooks/useRepositories";

type Tab = "metadata" | "upload" | "generate";

export const SlideMetadataView = ({ setSelectedTab }: { setSelectedTab: (tab: Tab) => void }) => {
    const { repositories, isLoadingRepositories, errorRepositories } = useRepositories();
    const [selectedRepo, setSelectedRepo] = useState<PresentationMetadata | null>(null);
    
    const handleBackToRepos = () => {
      setSelectedRepo(null);
    };
    
    return (
      <div>
        {selectedRepo ? (
          <SlideThumbnailList repository={selectedRepo} onBack={handleBackToRepos} />
        ) : (
          <RepositoriesList onSelectRepo={setSelectedRepo} repositories={repositories} isLoadingRepositories={isLoadingRepositories} errorRepositories={errorRepositories} setSelectedTab={setSelectedTab}/>
        )}
      </div>
    );
};