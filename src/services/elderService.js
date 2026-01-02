import { addDocument, getDocuments, deleteDocument } from "./firestoreService";

const COLLECTION_NAME = "elders";

/**
 * Add a new elder.
 * @param {object} data - Elder data (must include userId).
 * @returns {Promise<string>} The new elder ID.
 */
export const addElder = async (data) => {
    if (!data.userId) {
        throw new Error("userId is required to add an elder.");
    }
    return await addDocument(COLLECTION_NAME, data);
};

/**
 * Get all elders for a specific user.
 * @param {string} userId
 * @returns {Promise<Array>} List of elders.
 */
export const getEldersByUser = async (userId) => {
    if (!userId) {
        throw new Error("userId is required to fetch elders.");
    }
    return await getDocuments(COLLECTION_NAME, [
        { field: "userId", operator: "==", value: userId }
    ]);
};

/**
 * Delete an elder by ID.
 * @param {string} elderId
 * @returns {Promise<void>}
 */
export const deleteElder = async (elderId) => {
    return await deleteDocument(COLLECTION_NAME, elderId);
};
