import { addDocument, getDocuments, deleteDocument, updateDocument } from "./firestoreService";

const COLLECTION_NAME = "medicines";

/**
 * Add a new medicine.
 * @param {object} data - Medicine data (must include elderId).
 * @returns {Promise<string>} The new medicine ID.
 */
export const addMedicine = async (data) => {
    if (!data.elderId) {
        throw new Error("elderId is required to add a medicine.");
    }
    return await addDocument(COLLECTION_NAME, {
        ...data,
        status: data.status || 'pending' // Default status if not provided, though typically this field might be used for adherence tracking on specific instances, here it's on the medicine definition itself per requirements.
    });
};

/**
 * Get all medicines for a specific elder.
 * @param {string} elderId
 * @returns {Promise<Array>} List of medicines.
 */
export const getMedicinesByElder = async (elderId) => {
    if (!elderId) {
        throw new Error("elderId is required to fetch medicines.");
    }
    return await getDocuments(COLLECTION_NAME, [
        { field: "elderId", operator: "==", value: elderId }
    ]);
};

/**
 * Update the status of a medicine (e.g., 'taken', 'missed', 'pending').
 * Note: In a full app, status usually belongs to a "Reminder" or "Dose" instance, 
 * but per requirements we are updating the medicine document itself.
 * @param {string} medicineId
 * @param {string} status
 * @returns {Promise<void>}
 */
export const updateMedicineStatus = async (medicineId, status) => {
    return await updateDocument(COLLECTION_NAME, medicineId, { status });
};

/**
 * Delete a medicine by ID.
 * @param {string} medicineId
 * @returns {Promise<void>}
 */
export const deleteMedicine = async (medicineId) => {
    return await deleteDocument(COLLECTION_NAME, medicineId);
};
