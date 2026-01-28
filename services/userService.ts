
import { UserProfile } from "../types";

// MOCKED USER SERVICE (No Firestore)

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  // Return null so the app doesn't think a profile exists, 
  // or return a mock if needed. For now null seems safer to avoid confusing logic.
  return null;
};

export const createUserProfile = async (uid: string, email: string): Promise<UserProfile> => {
  const role = email === "xelenttraders@gmail.com" ? "admin" : "user";
  return {
    uid,
    email,
    credits: 999, // Infinite credits since we removed the DB
    role,
    createdAt: Date.now(),
  };
};

export const deductCredit = async (uid: string) => {
  // No-op
};

export const incrementGlobalGenerations = async () => {
  // No-op
};

export const subscribeToGlobalStats = (callback: (data: { totalGenerations: number }) => void) => {
  // Mock callback
  callback({ totalGenerations: 1337 }); // Fake number
  return () => { }; // Mock unsubscribe
};

// Admin Functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
  return [];
};

export const addCreditsToUser = async (uid: string, amount: number) => {
  // No-op
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  // No-op
};
