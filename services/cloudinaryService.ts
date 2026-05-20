
/**
 * Cloudinary Service for Mwijay Note
 * Handles image uploads to Cloudinary.
 * Credentials should be provided via environment variables or user input.
 */

export interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
}


class CloudinaryService {
    private config: CloudinaryConfig | null = {
        cloudName: 'mwijay-note',
        uploadPreset: 'mwijay-note'
    };

    updateConfig(newConfig?: CloudinaryConfig) {
        if (newConfig && newConfig.cloudName && newConfig.uploadPreset) {
            this.config = newConfig;
        }
    }

    async uploadImage(file: File | Blob): Promise<string> {
        if (!this.config) {
            throw new Error("Cloudinary not configured. Please provide credentials in settings.");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.config.uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }

    async uploadBase64(base64: string): Promise<string> {
        if (!this.config) {
            throw new Error("Cloudinary not configured.");
        }

        const formData = new FormData();
        formData.append('file', base64);
        formData.append('upload_preset', this.config.uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }
}

export const cloudinaryService = new CloudinaryService();
