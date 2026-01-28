import { supabase } from './supabaseClient';
import { uploadToImgBB, generateUniqueFilename } from './imgbbService';

export interface Announcement {
    id: string;
    created_at: string;
    title: string;
    message: string;
    image_url: string | null;
    is_active: boolean;
}

export const announcementService = {
    /**
     * Send a new announcement (Admin only).
     * Automatically uploads optional image to ImgBB.
     */
    sendAnnouncement: async (message: string, imageBase64: string | null, title: string = "System Announcement") => {
        let imageUrl = null;

        if (imageBase64) {
            try {
                // Generate a filename based on timestamp
                const filename = `announcement_${Date.now()}`;
                const uploadResult = await uploadToImgBB(imageBase64, filename);
                imageUrl = uploadResult;
            } catch (e) {
                console.error("Failed to upload announcement image", e);
                // Continue without image or throw? Let's throw to be safe
                throw new Error("Image upload failed");
            }
        }

        const { error } = await supabase
            .from('announcements')
            .insert({
                title,
                message,
                image_url: imageUrl,
                is_active: true
            });

        if (error) {
            console.error("Error creating announcement:", error);
            throw error;
        }
    },

    /**
     * Get the single latest active announcement
     */
    getLatestAnnouncement: async (): Promise<Announcement | null> => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            console.error('Error fetching announcement:', error);
            return null;
        }

        return data as Announcement;
    }
};
