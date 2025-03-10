import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/http-client";
import { toast } from "sonner";

export interface PresentationMetadata {
    id: string;
    title: string;
    storage_path: string;
    number_of_slides: number;
    image_path?: string;
    created_at: string;
}

export interface UploadRepositoryResponse {
    message: string;
    storage_path: string;
    presentation_id: number;
}

export const useRepositories = (options?: { onSuccess?: () => void }) => {
    const queryClient = useQueryClient();

    const { data: repositories, isLoading: isLoadingRepositories, error: errorRepositories } = useQuery({
        queryKey: ['repositories'],
        queryFn: () => apiClient.get<PresentationMetadata[]>('/repositories'),
        staleTime: 1000 * 60 * 5,
        refetchOnMount: false
    });

    const { mutateAsync: uploadRepository, isPending: isUploading } = useMutation({
        mutationFn: async ({ file, title }: { file: File, title: string }) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', title);
          return apiClient.postFormData<UploadRepositoryResponse>('/repository/upload', formData);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['repositories'] });
            const previousRepositories = queryClient.getQueryData(['repositories']);
            return { previousRepositories };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['repositories'], context?.previousRepositories);
            toast.error('Error uploading repository');
        },
        onSuccess: (data) => {
            toast.success("Successfully uploaded slide repository", {
                description: data.message,
            });
            options?.onSuccess?.();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['repositories'] });
        },
    });

    return {
        repositories: repositories ?? [],
        isLoadingRepositories,
        errorRepositories,
        uploadRepository,
        isUploading,
    };
};
