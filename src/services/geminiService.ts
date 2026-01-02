
import { Medicine } from "@/types";

export interface ParsedPrescription {
    elderId: string;
    medicines: Array<{
        name: string | null;
        dosage: string | null;
        frequency: string | null;
        timing: string | null;
        duration: string | null;
        instructions: string | null;
    }>;
}



export const analyzePrescription = async (
    file: File,
    elderId: string
): Promise<ParsedPrescription | null> => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('elderId', elderId);

        const response = await fetch('http://localhost:3001/api/analyze-prescription', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.details ? `${errorData.error}: ${errorData.details}` : (errorData.error || 'Failed to analyze prescription');
            throw new Error(errorMessage);
        }

        const parsedData = await response.json();

        // Ensure the response matches our expected structure
        // The backend returns { elderId, medicines: [...] }
        return parsedData as ParsedPrescription;

    } catch (error) {
        console.error("Prescription Analysis Error:", error);
        throw error;
    }
};
