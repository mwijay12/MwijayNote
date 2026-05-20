
import { useState, useEffect, useMemo } from 'react';
import { UserData, JournalEntry, ActionItem, AppView, JournalTopic } from '../types';
import { NewspaperIcon, FeatherIcon, CalendarIcon, ListTodoIcon } from '../components/Icons';
import React from 'react';

interface UseSmartNotificationsProps {
    userData: UserData | null;
    journals: JournalEntry[];
    onNavigate: (view: AppView) => void;
    onCreateNew: (type: any, topic: any) => void;
}

const isSameDate = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

export const useSmartNotifications = ({ userData, journals, onNavigate, onCreateNew }: UseSmartNotificationsProps) => {
    const [notifications, setNotifications] = useState<ActionItem[]>([]);

    useEffect(() => {
        const generateNotifications = () => {
            const now = new Date();
            const hour = now.getHours();
            const newNotifications: ActionItem[] = [];

            // 1. Check Journaling
            const lastJournal = journals.length > 0 ? new Date(journals[0].date) : null;
            const hasJournaledToday = lastJournal && isSameDate(lastJournal, now);

            if (!hasJournaledToday) {
                newNotifications.push({
                    id: 'daily-journal',
                    title: 'Daily Reflection',
                    description: 'You haven\'t journaled today. Capture your thoughts.',
                    icon: React.createElement(FeatherIcon, { className: "w-5 h-5 text-amber" }),
                    action: () => onCreateNew('Gratitude Journal', JournalTopic.GRATITUDE),
                    priority: hour > 20 ? 'high' : 'medium'
                });
            }

            // 2. Check News Reading
            const lastNewsRead = userData?.activityLog?.lastNewsRead ? new Date(userData.activityLog.lastNewsRead) : null;
            const hasReadNews = lastNewsRead && isSameDate(lastNewsRead, now);

            if (!hasReadNews && hour >= 9) {
                newNotifications.push({
                    id: 'read-news',
                    title: 'Growth & Tech News',
                    description: 'Catch up on today\'s wisdom and tech updates.',
                    icon: React.createElement(NewspaperIcon, { className: "w-5 h-5 text-blue-400" }),
                    action: () => onNavigate(AppView.NEWS),
                    priority: 'low'
                });
            }

            // 3. Evening Planning (After 6 PM)
            if (hour >= 18) {
                const lastPlanned = userData?.activityLog?.lastPlanningSession ? new Date(userData.activityLog.lastPlanningSession) : null;
                const hasPlanned = lastPlanned && isSameDate(lastPlanned, now);

                if (!hasPlanned) {
                    newNotifications.push({
                        id: 'plan-tomorrow',
                        title: 'Plan Tomorrow',
                        description: 'Set your intentions for the next day.',
                        icon: React.createElement(ListTodoIcon, { className: "w-5 h-5 text-green-400" }),
                        action: () => onCreateNew('Morning Intention', JournalTopic.MORNING), // Reusing morning template or similar
                        priority: 'high'
                    });
                }
            }

            setNotifications(newNotifications);
        };

        generateNotifications();
        const interval = setInterval(generateNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [userData?.activityLog, journals, onNavigate, onCreateNew]);

    return notifications;
};
