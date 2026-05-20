import React, { useEffect } from 'react';
import { db } from '../utils/db';
import { Reminder } from '../types';
import { LocalNotifications } from '@capacitor/local-notifications';

export const ReminderManager: React.FC = () => {
    useEffect(() => {
        const checkReminders = async () => {
            const reminders = await db.getAll('reminders') as Reminder[];
            const now = new Date();
            
            reminders.forEach(async (reminder) => {
                if (!reminder.completed) {
                    const reminderDate = new Date(reminder.date);
                    // Check if reminder is due (within the last minute)
                    const diff = now.getTime() - reminderDate.getTime();
                    
                    if (diff >= 0 && diff < 60000) {
                        // Native Notification
                        try {
                            const { display } = await LocalNotifications.checkPermissions();
                            if (display === 'granted') {
                                await LocalNotifications.schedule({
                                    notifications: [
                                        {
                                            title: "Mwijay Reminder",
                                            body: reminder.title,
                                            id: Math.floor(Math.random() * 10000),
                                            schedule: { at: new Date(Date.now() + 100) },
                                            sound: 'beep.wav',
                                            attachments: [],
                                            actionTypeId: "",
                                            extra: null
                                        }
                                    ]
                                });
                            }
                        } catch (err) {
                            console.warn("Native Notification Failed", err);
                        }
                        
                        // Play a sound
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play().catch(e => console.warn("Audio play failed", e));
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return null;
};
