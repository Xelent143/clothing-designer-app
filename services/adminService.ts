import { supabase } from './supabaseClient';
import { Profile } from '../contexts/AuthContext';

export const adminService = {
    /**
     * Fetch all user profiles (Admin only)
     */
    getAllUsers: async (): Promise<Profile[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
        return data as Profile[];
    },

    /**
     * Toggle user activation status
     */
    toggleUserStatus: async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_active: !currentStatus })
            .eq('id', userId);

        if (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },

    /**
     * Update user credits
     */
    updateUserCredits: async (userId: string, newCredits: number) => {
        const { error } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', userId);

        if (error) {
            console.error('Error updating credits:', error);
            throw error;
        }
    },

    /**
     * Update user account expiry date
     */
    updateUserExpiry: async (userId: string, expiryDate: string | null) => {
        const { error } = await supabase
            .from('profiles')
            .update({ expiry_date: expiryDate })
            .eq('id', userId);

        if (error) {
            console.error('Error updating expiry:', error);
            throw error;
        }
    }
};
