import { supabase } from './supabaseClient';
import { Profile } from '../contexts/AuthContext';

export const updateProfileBranding = async (userId: string, branding: Profile['branding']) => {
    const { error } = await supabase
        .from('profiles')
        .update({ branding })
        .eq('id', userId);

    if (error) throw error;
};

export const updateProfileApiKeys = async (userId: string, apiKeys: Profile['api_keys']) => {
    const { error } = await supabase
        .from('profiles')
        .update({ api_keys: apiKeys })
        .eq('id', userId);

    if (error) throw error;
};

export const incrementGenerations = async (userId: string, incrementBy: number) => {
    const { error } = await supabase
        .rpc('increment_generations', { user_id: userId, amount: incrementBy });

    if (error) {
        // Fallback for when RPC is not created yet (backward compatibility for dev)
        console.error("RPC Error (Auto-fixing locally via update):", error);
        // We can't easily fallback without knowing current amount, so we just log.
        // Users MUST run the SQL.
        throw error;
    }
};
