import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/http-client";
import { toast } from "sonner"

interface SlideMetadata {
    id: number;
    title?: string;
    category?: string;
    slide_type?: string;
    purpose?: string;
    tags?: string[];
    audience?: string;
    sales_stage?: string;
    image_path?: string;
}

interface SlideMetadataUpdate {
    title?: string;
    category?: string;
    slide_type?: string;
    purpose?: string;
    tags?: string[];
    audience?: string;
    sales_stage?: string;
}

export const useSlides = (
    presentationId: number,
    options?: { onSuccess?: () => void }
) => {
    const queryClient = useQueryClient();

    const { data: slides, isLoading: isLoadingSlides, error: errorSlides } = useQuery({
        queryKey: ['slides', presentationId],
        queryFn: () => apiClient.get<SlideMetadata[]>(`/slides/${presentationId}`),
    });

    const { mutateAsync: updateSlideMetadata, isPending: isUpdatingSlideMetadata } = useMutation({
        mutationFn: ({ slideId, metadata }: { slideId: number, metadata: SlideMetadataUpdate }) =>
            apiClient.put<SlideMetadata>(`/slides/metadata/${slideId}`, metadata),
        onMutate: async ({ slideId, metadata }) => {
            await queryClient.cancelQueries({ queryKey: ['slides', presentationId] });
            const previousSlides = queryClient.getQueryData(['slides', presentationId]);

            queryClient.setQueryData(['slides', presentationId], (old: SlideMetadata[] = []) => {
                return old.map(slide => 
                    slide.id === slideId ? { ...slide, ...metadata, isLoading: true } : slide
                );
            });

            return { previousSlides };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['slides', presentationId], context?.previousSlides);
            toast.error('Error updating slide metadata');
        },
        onSuccess: () => {
            toast.success('Slide metadata updated successfully');
            options?.onSuccess?.();
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['slides', presentationId] });
        },
    });

    return {
        slides: slides ?? [],
        isLoadingSlides,
        errorSlides,
        updateSlideMetadata,
        isUpdatingSlideMetadata,
    };
};