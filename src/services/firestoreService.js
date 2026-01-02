import { db } from "../firebase/firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where
} from "firebase/firestore";

/**
 * Add a new document to a collection.
 * @param {string} collectionName
 * @param {object} data
 * @returns {Promise<string>} The ID of the newly created document.
 */
export const addDocument = async (collectionName, data) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        throw new Error(`Error adding document to ${collectionName}: ${error.message}`);
    }
};

/**
 * Get documents from a collection, optionally filtered.
 * @param {string} collectionName
 * @param {Array<{field: string, operator: string, value: any}>} filters - Array of filter objects. operator defaults to '==' if not specified, but for simplicity here we assume simple equality or pass operator.
 * Note: simplistic implementation.
 * @returns {Promise<Array<object>>} Array of documents with their IDs.
 */
export const getDocuments = async (collectionName, filters = []) => {
    try {
        let q = collection(db, collectionName);

        if (filters && filters.length > 0) {
            const constraints = filters.map(f => where(f.field, f.operator || '==', f.value));
            q = query(q, ...constraints);
        }

        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return documents;
    } catch (error) {
        throw new Error(`Error getting documents from ${collectionName}: ${error.message}`);
    }
};

/**
 * Update a specific document.
 * @param {string} collectionName
 * @param {string} docId
 * @param {object} data
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, docId, data) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        throw new Error(`Error updating document ${docId} in ${collectionName}: ${error.message}`);
    }
};

/**
 * Delete a specific document.
 * @param {string} collectionName
 * @param {string} docId
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, docId) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
    } catch (error) {
        throw new Error(`Error deleting document ${docId} from ${collectionName}: ${error.message}`);
    }
};
