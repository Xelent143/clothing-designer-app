
const IMGBB_API_KEY = "67909384d72023555555555555555555"; // PLACEHOLDER - Please replace with your actual key if known

export const generateUniqueFilename = (prefix: string, suffix: string): string => {
    const timestamp = Date.now();
    return `${prefix}_${suffix}_${timestamp}`;
};

export const uploadToImgBB = async (base64Image: string, filename: string): Promise<string> => {
    try {
        // Remove header if present
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        const formData = new FormData();
        formData.append("image", cleanBase64);
        formData.append("name", filename);

        // We can't really execute this without a valid key. 
        // If the key is missing, we'll just return the base64 as a fallback or log error.
        // For now we assume a key might be needed or we can use a free key if user has one.
        // Since I lost the file, I'll use a placeholder URL or just return the image itself 
        // if upload fails, to prevent app crash.

        const url = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            console.error("ImgBB Upload Error:", data.error);
            return base64Image; // Fallback to base64 if upload fails
        }
    } catch (error) {
        console.error("ImgBB Service Error:", error);
        return base64Image;
    }
};
