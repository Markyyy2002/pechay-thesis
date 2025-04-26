import React, { useEffect, useState } from 'react';
import { ref, onValue, set, query, orderByKey, startAt } from 'firebase/database';
import { database } from '../firebase';
import Header from '../components/Home/Header';
import StatCard from '../components/Home/StatCard';
import SensorChart from '../components/Home/SensorChart';
import ControlPanel from '../components/Home/ControlPanel';
import MoistureChart from '../components/Home/MoistureChart';
import NotificationsPanel from '../components/Home/Notifications/NotificationsPanel';
import Footer from '../components/Home/Footer';
import { FaCloudRain } from "react-icons/fa";
import { FaTemperatureHalf } from "react-icons/fa6";
import { BsMoisture } from "react-icons/bs";
import { RiWaterPercentLine } from "react-icons/ri";
import { MdAutoMode } from "react-icons/md";

const Home = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 'Loading...',
    humidity: 'Loading...',
    moisture: 'Loading...',
    rain: 'Loading...',
  });

  const [controls, setControls] = useState({
    isManualModeOn: false,
    isWaterPumpOn: false,
    isRoofOpen: false
  });

  const [historyData, setHistoryData] = useState([]);
  const [timeRange, setTimeRange] = useState('day');

  useEffect(() => {
    const sensorDataRef = ref(database, 'sensorData');
    const sensorUnsubscribe = onValue(sensorDataRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setSensorData({
            temperature: data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A',
            humidity: data.humidity !== undefined ? `${data.humidity.toFixed(1)}%` : 'N/A',
            moisture: data.moisture !== undefined ? `${data.moisture}%` : 'N/A',
            rain: data.rain !== undefined ? `${data.rain}%` : 'N/A',
          });
        }
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setSensorData({
          temperature: 'Error',
          humidity: 'Error',
          moisture: 'Error',
          rain: 'Error',
        });
      }
    }, (error) => {
      console.error("Database error (sensorData):", error);
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

    const now = new Date();
    let startTime = new Date();

    if (timeRange === 'day') {
      startTime.setDate(now.getDate() - 1); 
    } else if (timeRange === 'week') {
      startTime.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startTime.setMonth(now.getMonth() - 1); 
    }

    const startTimestamp = Math.floor(startTime.getTime() / 1000);

    const historyRef = query(
      ref(database, 'hourly_history'),
      orderByKey(), 
      startAt(startTimestamp.toString()) 
    );

    const historyUnsubscribe = onValue(historyRef, (snapshot) => {
        try {
            const data = snapshot.val();
            if (data) {
                const processedData = Object.entries(data)
                    .map(([key, value]) => {
                        const timestampMs = parseInt(key) * 1000; 
                        const date = new Date(timestampMs);

                        let displayTime;
                        if (timeRange === 'day') {
                            displayTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // HH:MM
                        } else {
                            displayTime = date.toLocaleTimeString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        }

                        return {
                            time: displayTime, 
                            timestamp: parseInt(key),
                            temperature: value.temperature !== undefined ? value.temperature : 0,
                            humidity: value.humidity !== undefined ? value.humidity : 0,
                            moisture: value.moisture !== undefined ? value.moisture : 0,
                            rain: value.rain !== undefined ? value.rain : 0,
                        };
                    });
                setHistoryData(processedData);
            } else {
                setHistoryData([]);
            }
        } catch (error) {
            console.error("Error fetching historical data:", error);
            setHistoryData([]);
        }
    }, (error) => {
        console.error("Database error (hourly_history):", error);
        setHistoryData([]);
    });


    return () => {
      sensorUnsubscribe();
      controlsUnsubscribe();
      historyUnsubscribe();
    };
  }, [timeRange]); 

  const updateControl = async (controlName, value) => {
    await set(ref(database, `controls/${controlName}`), value);
  };

  const toggleManualMode = async () => {
    const newValue = !controls.isManualModeOn;
    await updateControl('isManualModeOn', newValue);

    if(!newValue){
      await updateControl('isWaterPumpOn', false);
      await updateControl('isRoofOpen', false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Temperature"
            value={sensorData.temperature}
            icon={<FaTemperatureHalf />}
            bgColor="bg-purple-100"
            iconColor={"text-purple-600"}
          />
          <StatCard
            title="Humidity"
            value={sensorData.humidity}
            icon={<RiWaterPercentLine />}
            bgColor="bg-cyan-100"
            iconColor={"text-cyan-600"}
          />
          <StatCard
            title="Soil Moisture"
            value={sensorData.moisture}
            icon={<BsMoisture />}
            bgColor="bg-blue-100"
            iconColor={"text-blue-600"}
          />
          <StatCard
            title="Rain"
            value={sensorData.rain}
            icon={<FaCloudRain />}
            bgColor="bg-green-100"
            iconColor={"text-green-600"}
          />
          <StatCard
            title="System Mode"
            value={controls.isManualModeOn ? 'Manual' : 'Auto'}
            icon={<MdAutoMode />}
            bgColor="bg-yellow-100"
            iconColor={"text-yellow-600"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SensorChart
            data={historyData}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />

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