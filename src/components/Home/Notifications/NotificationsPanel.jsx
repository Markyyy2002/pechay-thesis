import React, { useEffect, useState } from 'react'
import { ClearAllIcon } from './NotificationIcons';
import NotificationCard from './NotificationCard';
import { onValue, ref, remove } from 'firebase/database';
import { database } from '../../../firebase';

const NotificationsPanel = () => {
    const [notifications, setNotifications] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const notificationsRef = ref(database, 'notifications');
        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setNotifications(data);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleClearAll = async () => {
        try {
            await remove(ref(database, 'notifications'));
        } catch (error) {
            console.error('Error clearing all notifications:', error);
        }
    };

    return (
        <div className='mt-6 bg-white rounded-lg shadow-sm p-6'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-medium text-gray-800'>Notifications</h2>
                {Object.keys(notifications).length > 0 && (
                    <button onClick={handleClearAll} className='flex items-center text-sm text-gray-600 hover:text-red-500'>
                        <ClearAllIcon />
                        <span className='ml-1'>Clear All</span>
                    </button>
                )}
            </div>

            <div className="overflow-hidden">
                {loading ? (
                    <div className="text-center py-4">Loading notifications...</div>
                ) : Object.keys(notifications).length > 0 ? (
                    <div className="h-full overflow-y-auto pr-2">
                        {Object.entries(notifications).map(([id, notification]) => (
                            <NotificationCard
                                key={id}
                                id={id}
                                notification={notification}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No notifications to display
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationsPanel