import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import Header from '../components/Home/Header';
import StatCard from '../components/Home/StatCard';
import SensorChart from '../components/Home/SensorChart';
import ControlPanel from '../components/Home/ControlPanel';
import MoistureChart from '../components/Home/MoistureChart';
import NotificationsPanel from '../components/Home/Notifications/NotificationsPanel';
import Footer from '../components/Home/Footer';
import { TemperatureIcon, MoistureIcon, RainIcon, SystemModeIcon } from '../components/Home/Icons';

const Home = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 'Loading...',
    moisture: 'Loading...',
    rain: 'Loading...',
  });

  const [controls, setControls] = useState({
    isManualModeOn: false,
    isWaterPumpOn: false,
    isRoofOpen: false
  });

  const [historyData, setHistoryData] = useState([
    { time: '00:00', temperature: 24, moisture: 65, rain: 0 },
    { time: '04:00', temperature: 22, moisture: 68, rain: 0 },
    { time: '08:00', temperature: 25, moisture: 62, rain: 10 },
    { time: '12:00', temperature: 28, moisture: 55, rain: 5 },
    { time: '16:00', temperature: 27, moisture: 58, rain: 0 },
    { time: '20:00', temperature: 25, moisture: 60, rain: 0 },
    { time: '24:00', temperature: 23, moisture: 63, rain: 0 },
  ]);

  useEffect(() => {
    const sensorDataRef = ref(database, 'sensorData');
    const sensorUnsubscribe = onValue(sensorDataRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setSensorData({
            temperature: data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A',
            moisture: data.moisture !== undefined ? `${data.moisture}%` : 'N/A',
            rain: data.rain !== undefined ? `${data.rain}%` : 'N/A',
          });

          const newEntry = {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            temperature: data.temperature || 0,
            moisture: data.moisture || 0,
            rain: data.rain || 0
          };

          setHistoryData(prevData => {
            const newData = [...prevData, newEntry];
            if (newData.length > 7) {
              return newData.slice(newData.length - 7);
            }
            return newData;
          });
        }
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setSensorData({
          temperature: 'Error',
          moisture: 'Error',
          rain: 'Error',
        });
      }
    }, (error) => {
      console.error("Database error:", error);
    });

    const controlsRef = ref(database, 'controls');
    const controlsUnsubscribe = onValue(controlsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setControls({
          isManualModeOn: data.isManualModeOn || false,
          isWaterPumpOn: data.isWaterPumpOn || false,
          isRoofOpen: data.isRoofOpen || false
        });
      }
    });

    return () => {
      sensorUnsubscribe();
      controlsUnsubscribe();
    };
  }, []);

  const updateControl = async (controlName, value) => {
    await set(ref(database, `controls/${controlName}`), value);
  };

  const toggleManualMode = async () => {
    const newValue = !controls.isManualModeOn;
    await updateControl('isManualModeOn', newValue);
  };

  const toggleWaterPump = async () => {
    const newValue = !controls.isWaterPumpOn;
    await updateControl('isWaterPumpOn', newValue);
  };

  const toggleRoof = async () => {
    const newValue = !controls.isRoofOpen;
    await updateControl('isRoofOpen', newValue);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Temperature"
            value={sensorData.temperature}
            icon={<TemperatureIcon />}
            bgColor="bg-purple-100"
          />

          <StatCard
            title="Soil Moisture"
            value={sensorData.moisture}
            icon={<MoistureIcon />}
            bgColor="bg-blue-100"
          />

          <StatCard
            title="Rain"
            value={sensorData.rain}
            icon={<RainIcon />}
            bgColor="bg-green-100"
          />

          <StatCard
            title="System Mode"
            value={controls.isManualModeOn ? 'Manual' : 'Auto'}
            icon={<SystemModeIcon />}
            bgColor="bg-yellow-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SensorChart data={historyData} />

          <ControlPanel
            controls={controls}
            toggleManualMode={toggleManualMode}
            toggleWaterPump={toggleWaterPump}
            toggleRoof={toggleRoof}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          <div className='lg:col-span-2'>
            <MoistureChart data={historyData} />
          </div>
          <NotificationsPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;