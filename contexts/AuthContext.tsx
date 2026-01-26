import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// Define the shape of our Profile from the database
export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    mobile_number: string | null;
    role: 'user' | 'admin';
    is_active: boolean;
    credits: number;
    total_generations?: number;
    branding?: {
        companyName?: string;
        logoBase64?: string;
        enabled: boolean;
    };
    api_keys?: {
        gemini?: string;
    };
    expiry_date?: string; // ISO string
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null; // Added profile
    loading: boolean;
    signIn: (email: string, password?: string, metadata?: { full_name: string; mobile_number: string }) => Promise<{ error: any }>;
    signUp: (email: string, password: string, metadata: { full_name: string; mobile_number: string }) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
    refreshProfile: () => Promise<void>; // To manually refresh credits/role
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            if (data) {
                const profileData = data as Profile;

                // Security Checks are now handled by the UI (AccountLockedModal) based on profile data
                // We do NOT sign out automatically so the user can see the specific reason (credits/expiry)

                setProfile(profileData);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id).then(() => setLoading(false));
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password?: string) => {
        if (password) {
            return supabase.auth.signInWithPassword({ email, password });
        }
        return supabase.auth.signInWithOtp({ email });
    };

    const signUp = async (email: string, password: string, metadata: { full_name: string; mobile_number: string }) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
    };

    const signOut = async () => {
        setProfile(null);
        return supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
