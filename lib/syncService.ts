
import { db as localDb } from '../utils/db';
import { db as firestoreDb, auth } from './firebase';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where
} from 'firebase/firestore';
import { triggerN8nWebhook, N8nPayload } from '../services/n8nService';

export const syncToCloud = async (storeName: string, data: any) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const docRef = doc(firestoreDb, `users/${user.uid}/${storeName}/${data.id}`);
        await setDoc(docRef, { ...data, userId: user.uid });
    } catch (error) {
        console.error(`Sync to cloud failed for ${storeName}:`, error);
    }
};

export const deleteFromCloud = async (storeName: string, id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const docRef = doc(firestoreDb, `users/${user.uid}/${storeName}/${id}`);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Delete from cloud failed for ${storeName}:`, error);
    }
};

export const pullFromCloud = async (storeName: string) => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
        const q = query(collection(firestoreDb, `users/${user.uid}/${storeName}`), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const cloudData: any[] = [];
        querySnapshot.forEach((doc) => {
            cloudData.push({ ...doc.data() });
        });

        // Update local DB
        for (const item of cloudData) {
            await localDb.put(storeName as any, item);
        }
        return cloudData;
    } catch (error) {
        console.error(`Pull from cloud failed for ${storeName}:`, error);
        return [];
    }
};
