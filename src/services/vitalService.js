import { addDocument, getDocuments, deleteDocument } from "./firestoreService";

const COLLECTION_NAME = "vitals";

/**
 * Add a new vital sign record.
 * @param {object} data - Vital data (must include elderId, type, value, unit, recordedAt).
 * @returns {Promise<string>} The new vital ID.
 */
export const addVital = async (data) => {
    if (!data.elderId) {
        throw new Error("elderId is required to add a vital.");
    }
    return await addDocument(COLLECTION_NAME, data);
};

/**
 * Get all vitals for a specific elder.
 * @param {string} elderId
 * @returns {Promise<Array>} List of vital records.
 */
export const getVitalsByElder = async (elderId) => {
    if (!elderId) {
        throw new Error("elderId is required to fetch vitals.");
    }
    return await getDocuments(COLLECTION_NAME, [
        { field: "elderId", operator: "==", value: elderId }
    ]);
};

/**
 * Delete a vital record by ID.
 * @param {string} vitalId
 * @returns {Promise<void>}
 */
export const deleteVital = async (vitalId) => {
    return await deleteDocument(COLLECTION_NAME, vitalId);
};
