import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Standard Google authentication provider constraints
googleAuthProvider.addScope("profile");
googleAuthProvider.addScope("email");

/**
 * Validate Connection to Firestore on startup
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase Firestore connectivity verified successfully!");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration / client offline status.");
    } else {
      console.log("Firebase connection established (handshake verified).");
    }
  }
}
testConnection();

/**
 * Triggers Firebase Google Auth Popup
 */
export async function authenticateWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      idToken,
    };
  } catch (error: any) {
    console.error("Firebase Google Auth Dialog Error:", error);
    throw error;
  }
}

/**
 * Perform Firebase Sign Out
 */
export async function performFirebaseSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Sign Out Error:", error);
  }
}
