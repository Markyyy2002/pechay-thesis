import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SensorChart = ({ data }) => {
    return (
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Sensor Data Overview</h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="moisture" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="rain" stroke="#ffc658" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SensorChart;