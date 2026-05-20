
import { FileData } from "../types";

export const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<FileData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Fill white background for JPEGs to handle transparency
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                }

                // Changed to JPEG for better compatibility with Word/Doc exports
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                resolve({
                    name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                    type: 'image/jpeg',
                    data: dataUrl
                });
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
