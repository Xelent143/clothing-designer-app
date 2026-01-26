import axios from 'axios';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export const generateUniqueFilename = (username: string, context: string = 'image'): string => {
    const sanitizedUser = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    // Format: username-date-time-context
    return `${sanitizedUser}-${date}-${context}`;
};

export const uploadToImgBB = async (base64Image: string, filename: string): Promise<string | null> => {
    if (!IMGBB_API_KEY) {
        console.warn("ImgBB API Key missing");
        return null;
    }

    try {
        const formData = new FormData();
        // Remove header if present (data:image/png;base64,)
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        formData.append('image', base64Data);
        formData.append('name', filename);

        // Silent upload - no alerts or user-facing errors
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);

        if (response.data && response.data.success) {
            console.log(`[ImgBB] Uploaded: ${filename}`, response.data.data.url);
            return response.data.data.url;
        }
    } catch (error) {
        // Silent fail
        console.error("[ImgBB] Upload failed silently:", error);
    }
    return null;
};
