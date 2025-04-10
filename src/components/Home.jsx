import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import bgImage from '../assets/image/bg.jpg';

const Home = () => {
  const navigate = useNavigate();
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

  // Realtime data listeners
  useEffect(() => {
    // Sensor data listener
    const sensorDataRef = ref(database, 'sensorData');
    const sensorUnsubscribe = onValue(sensorDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData({
          temperature: data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : 'N/A',
          moisture: data.moisture !== undefined ? `${data.moisture}%` : 'N/A',
          rain: data.rain !== undefined ? `${data.rain}%` : 'N/A',
        });
      }
    });

    // Controls listener
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <label style={styles.toggleSwitch}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={styles.toggleInput}
      />
      <span style={{
        ...styles.toggleSlider,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: checked ? '#4CAF50' : '#ccc',
        opacity: disabled ? 0.6 : 1
      }}>
        <span style={{
          ...styles.toggleKnob,
          transform: checked ? 'translateX(26px)' : 'translateX(0)'
        }} />
      </span>
    </label>
  );

  const ControlRow = ({ label, checked, onChange, disabled = false }) => (
    <div style={styles.controlRow}>
      <span>{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <h1 style={styles.title}>Automated Plant Nursery</h1>

        <div style={styles.dataContainer}>
          <div style={styles.dataCard}>
            <h3>Temperature</h3>
            <div style={styles.dataValue}>{sensorData.temperature}</div>
          </div>

          <div style={styles.dataCard}>
            <h3>Soil Moisture</h3>
            <div style={styles.dataValue}>{sensorData.moisture}</div>
          </div>

          <div style={styles.dataCard}>
            <h3>Rain</h3>
            <div style={styles.dataValue}>{sensorData.rain}</div>
          </div>

          <div style={styles.dataCard}>
            <h3>Water Pump</h3>
            <div style={{
              ...styles.dataValue,
              color: controls.isWaterPumpOn ? '#4CAF50' : '#f44336'
            }}>
              {controls.isWaterPumpOn ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>

        <div style={styles.controlPanel}>
          <h3>System Controls</h3>
          
          <div style={styles.controlsContainer}>
            <ControlRow 
              label="Manual Mode" 
              checked={controls.isManualModeOn} 
              onChange={toggleManualMode} 
            />
            
            <ControlRow 
              label="Water Pump" 
              checked={controls.isWaterPumpOn} 
              onChange={toggleWaterPump} 
              disabled={!controls.isManualModeOn} 
            />
            
            <ControlRow 
              label="Roof" 
              checked={controls.isRoofOpen} 
              onChange={toggleRoof} 
              disabled={!controls.isManualModeOn} 
            />
          </div>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

const styles = {
  background: {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    padding: '30px',
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center'
  },
  title: {
    color: '#2E7D32',
    marginBottom: '30px',
    fontSize: '28px'
  },
  dataContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  dataValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  controlPanel: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px'
  },
  controlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  toggleSwitch: {
    display: 'inline-block',
    position: 'relative',
    width: '60px',
    height: '34px'
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0
  },
  toggleSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: '.4s',
    borderRadius: '34px'
  },
  toggleKnob: {
    position: 'absolute',
    height: '26px',
    width: '26px',
    left: '4px',
    bottom: '4px',
    backgroundColor: 'white',
    transition: '.4s',
    borderRadius: '50%'
  },
  logoutButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '12px 25px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};

export default Home;