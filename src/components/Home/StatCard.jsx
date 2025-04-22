import React from 'react';

const StatCard = ({ title, value, icon, bgColor, iconColor }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
            <div className={`rounded-full ${bgColor} p-3 mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;