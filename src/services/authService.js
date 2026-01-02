import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        throw new Error(`Sign up failed: ${error.message}`);
    }
};

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        throw new Error(`Sign in failed: ${error.message}`);
    }
};

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(`Sign out failed: ${error.message}`);
    }
};

/**
 * Get the currently signed-in user.
 * @returns {import("firebase/auth").User|null}
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};
