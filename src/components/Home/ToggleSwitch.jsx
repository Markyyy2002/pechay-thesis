import React from 'react';

const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
    ringColor = "ring-green-300",
    checkedBgColor = "bg-green-600"
}) => {
    return (
        <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:${ringColor} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${checkedBgColor}`}></div>
        </label>
    );
};

export default ToggleSwitch;