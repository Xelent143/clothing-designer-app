
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, increment, onSnapshot } from "firebase/firestore";
import { UserProfile } from "../types";

const USERS_COLLECTION = "users";
const STATS_COLLECTION = "stats";
const GLOBAL_STATS_DOC = "global";

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    if (error.code === 'permission-denied') {
      console.warn("⚠️ FIRESTORE PERMISSION DENIED: Please check your Firestore Security Rules.");
    }
    return null;
  }
};

export const createUserProfile = async (uid: string, email: string): Promise<UserProfile> => {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const role = email === "xelenttraders@gmail.com" ? "admin" : "user";

  const newProfile: UserProfile = {
    uid,
    email,
    credits: 5,
    role,
    createdAt: Date.now(),
  };

  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), newProfile);
    return newProfile;
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const deductCredit = async (uid: string) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    credits: increment(-1)
  });
  // Also increment the global generation counter whenever a credit is used
  await incrementGlobalGenerations();
};

/**
 * Increments the global counter of total designs created on the platform
 */
export const incrementGlobalGenerations = async () => {
  const statsRef = doc(db, STATS_COLLECTION, GLOBAL_STATS_DOC);
  try {
    const statsDoc = await getDoc(statsRef);
    if (!statsDoc.exists()) {
      await setDoc(statsRef, { totalGenerations: 1 });
    } else {
      await updateDoc(statsRef, {
        totalGenerations: increment(1)
      });
    }
  } catch (e) {
    console.error("Error updating global stats:", e);
  }
};

/**
 * Returns a real-time listener for global platform stats
 */
export const subscribeToGlobalStats = (callback: (data: { totalGenerations: number }) => void) => {
  const statsRef = doc(db, STATS_COLLECTION, GLOBAL_STATS_DOC);
  return onSnapshot(statsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as { totalGenerations: number });
    } else {
      callback({ totalGenerations: 0 });
    }
  });
};

// Admin Functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users;
  } catch (error: any) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const addCreditsToUser = async (uid: string, amount: number) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    credits: increment(amount)
  });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, data);
};
