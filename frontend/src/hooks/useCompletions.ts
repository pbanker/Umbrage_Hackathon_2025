import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/http-client";
import { toast } from "sonner";

interface PresentationInput {
    title: string;
    client_name: string;
    industry: string;
    description: string;
    target_audience: string;
    key_messages: string[];
    num_slides?: number;
    preferred_slide_types?: string[];
    tone?: string;
    additional_context?: string;
}

interface BlobResponse {
    blob: Blob;
    headers: Headers;
}

export const useCompletions = (options?: { onSuccess?: () => void }) => {
    const { mutateAsync: generatePresentation, isPending: isGenerating } = useMutation({
        mutationFn: async (input: PresentationInput) => {

            const response = await apiClient.request<BlobResponse>('/completions/generate-presentation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
                responseType: 'blob'
            });
            
            const blob = new Blob([response.blob], {
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            });
            
            const filename = response.headers.get('content-disposition')
                ?.split('filename=')[1]
                ?.replace(/["']/g, '')
                ?? `${input.title.replace(/\s+/g, '_')}.pptx`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true, filename };
        },
        onMutate: () => {
            toast.loading('Generating presentation...');
        },
        onError: (error) => {
            toast.error('Failed to generate presentation');
            console.error('Presentation generation error:', error);
        },
        onSuccess: (data) => {
            toast.success(`Successfully generated presentation: ${data.filename}`);
            options?.onSuccess?.();
        },
    });

    return {
        generatePresentation,
        isGenerating,
    };
};
