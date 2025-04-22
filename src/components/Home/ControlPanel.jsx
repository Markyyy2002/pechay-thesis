import React from 'react';
import ToggleSwitch from './ToggleSwitch';

const ControlPanel = ({ controls, toggleManualMode, toggleWaterPump, toggleRoof }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">System Controls</h2>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800">Manual Mode</p>
                        <p className="text-sm text-gray-500">Override automatic controls</p>
                    </div>
                    <ToggleSwitch
                        checked={controls.isManualModeOn}
                        onChange={toggleManualMode}
                        ringColor="ring-green-300"
                        checkedBgColor="bg-green-600"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800">Water Pump</p>
                        <p className="text-sm text-gray-500">Current status: {controls.isWaterPumpOn ? 'ON' : 'OFF'}</p>
                    </div>
                    <ToggleSwitch
                        checked={controls.isWaterPumpOn}
                        onChange={toggleWaterPump}
                        disabled={!controls.isManualModeOn}
                        ringColor="ring-blue-300"
                        checkedBgColor="bg-blue-600"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800">Roof Control</p>
                        <p className="text-sm text-gray-500">Current status: {controls.isRoofOpen ? 'OPEN' : 'CLOSED'}</p>
                    </div>
                    <ToggleSwitch
                        checked={controls.isRoofOpen}
                        onChange={toggleRoof}
                        disabled={!controls.isManualModeOn}
                        ringColor="ring-yellow-300"
                        checkedBgColor="bg-yellow-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;