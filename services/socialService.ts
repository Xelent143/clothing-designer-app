
import { supabase } from './supabaseClient';

/**
 * Helper: Converts Base64 to Blob for uploading
 */
const base64ToBlob = async (base64Data: string): Promise<Blob> => {
    const response = await fetch(base64Data);
    const blob = await response.blob();
    return blob;
};

/**
 * 1. Uploads the generated image to Supabase Storage to get a Public URL.
 * Instagram API requires a public URL for the 'image_url' parameter.
 */
export const uploadImageToPublicStorage = async (base64Image: string, userId: string): Promise<string> => {
    try {
        const blob = await base64ToBlob(base64Image);
        const fileName = `${userId}/social-posts/${Date.now()}.png`;

        // We assume a bucket named 'public-assets' or 'images' exists and is public.
        // If not, this step will fail and we'll handle it.
        const BUCKET_NAME = 'public-assets';

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            // Fallback: try 'images' bucket if 'public-assets' fails
            console.warn("Upload to public-assets failed, trying 'images'...", error);
            const { data: fallbackData, error: fallbackError } = await supabase.storage
                .from('images')
                .upload(fileName, blob, { contentType: 'image/png', upsert: true });

            if (fallbackError) throw fallbackError;

            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            return publicUrlData.publicUrl;
        }

        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        return publicUrlData.publicUrl;

    } catch (error) {
        console.error("Storage Upload Error:", error);
        throw new Error("Failed to upload image to public storage. Ensure Supabase Storage 'public-assets' bucket exists and is public.");
    }
};

/**
 * 2. Publish to Instagram via Graph API
 */
export const publishToInstagram = async (
    imageUrl: string,
    caption: string,
    accessToken: string,
    instagramUserId: string
): Promise<string> => {

    // Step A: Create Media Container
    const containerUrl = `https://graph.facebook.com/v18.0/${instagramUserId}/media`;
    const containerParams = new URLSearchParams({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
    });

    const containerRes = await fetch(`${containerUrl}?${containerParams.toString()}`, { method: 'POST' });
    const containerData = await containerRes.json();

    if (containerData.error) {
        console.error("IG Container Error:", containerData.error);
        throw new Error(`Instagram API Error (Container): ${containerData.error.message}`);
    }

    const creationId = containerData.id;

    // Step B: Publish Media
    const publishUrl = `https://graph.facebook.com/v18.0/${instagramUserId}/media_publish`;
    const publishParams = new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken,
    });

    // Wait a brief moment for processing (sometimes IG needs a sec for the image)
    await new Promise(r => setTimeout(r, 2000));

    const publishRes = await fetch(`${publishUrl}?${publishParams.toString()}`, { method: 'POST' });
    const publishData = await publishRes.json();

    if (publishData.error) {
        console.error("IG Publish Error:", publishData.error);
        throw new Error(`Instagram API Error (Publish): ${publishData.error.message}`);
    }

    return publishData.id; // Return the new Media ID
};

/**
 * 3. Cleanup: Deletes the image from storage to save space.
 * Call this after the post is successfully published or if posting fails.
 */
export const deleteImageFromStorage = async (publicUrl: string): Promise<void> => {
    try {
        // Extract the path from the URL. 
        // URL format: https://.../storage/v1/object/public/public-assets/USER_ID/social-posts/TIMESTAMP.png
        const urlObj = new URL(publicUrl);
        const pathParts = urlObj.pathname.split('/public-assets/');

        if (pathParts.length !== 2) {
            console.warn("Could not parse storage path for cleanup:", publicUrl);
            return;
        }

        const filePath = decodeURIComponent(pathParts[1]);

        const { error } = await supabase.storage
            .from('public-assets')
            .remove([filePath]);

        if (error) throw error;
        console.log("Temporary social image deleted:", filePath);

    } catch (error) {
        console.error("Cleanup Error (Non-fatal):", error);
    }
};
