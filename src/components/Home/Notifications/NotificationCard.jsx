import React from 'react'
import { ref, remove } from 'firebase/database';
import { DeleteIcon, ErrorIcon, InfoIcon, WarningIcon } from './NotificationIcons';

const NotificationCard = ({ id, notification }) => {
    const { message, severity, timestamp } = notification;

    const handleDelete = async () => {
        try {
            await remove(ref(database, `notifications/${id}`));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    const getIcon = () => {
        switch (severity) {
            case 'info':
                return <InfoIcon />;
            case 'warning':
                return <WarningIcon />;
            case 'error':
                return <ErrorIcon />;
            default:
                return null;
        }
    }

    const getSeverityColor = () => {
        switch (severity) {
            case 'info':
                return 'border-blue-200 bg-blue-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    }
    return (
        <div className={`p-4 mb-2 border rounded-lg ${getSeverityColor()} flex items-start`}>
            <div className='mr-3 mt-1'>
                {getIcon()}
            </div>
            <div className='flex-1'>
                <div className='text-sm font-medium'>{message}</div>
                <div className='text-xs text-gray-500'>{timestamp}</div>
            </div>
            <button onClick={handleDelete} className='ml-2 p-1 rounded-full hover:bg-gray-200'>
                <DeleteIcon />
            </button>
        </div>
    )
}

export default NotificationCard