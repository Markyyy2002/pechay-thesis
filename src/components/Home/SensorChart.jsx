import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SensorChart = ({ data, timeRange, setTimeRange }) => {

    const TimeRangeButton = ({ range, label }) => (
        <button
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-sm cursor-pointer rounded-md transition-colors ${
                timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium text-gray-800 sm:text-lg">Data Overview</h2>
                <div className="flex space-x-2">
                    <TimeRangeButton range="day" label="Day" />
                    <TimeRangeButton range="week" label="Week" />
                    <TimeRangeButton range="month" label="Month" />
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}> {/* Adjusted left margin */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            fontSize={12} 
                            interval="preserveStartEnd" 
                        />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#7F21BE" dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#36A1BF" dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="moisture" name="Moisture (%)" stroke="#3E6CD1" dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="rain" name="Rain (%)" stroke="#07A242" dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SensorChart;