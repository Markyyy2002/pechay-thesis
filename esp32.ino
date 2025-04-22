#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include <Stepper.h>
#include <time.h>

// Sensor and pin definitions
#define RAIN_PIN 34
#define MOISTURE_PIN 33
#define DHTPIN 26
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// Firebase credentials
#define FIREBASE_HOST "https://pechay-thesis-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "AIzaSyDmBWWU8biW7hZ4jn8DCFiY0D7kvOnMQJ"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

const char* ssid = "Marky";
const char* pass = "markjon2990";

// NTP Server for timestamp
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 28800;  // GMT+8 for Philippines (8 hours * 3600 seconds)
const int   daylightOffset_sec = 0;

// Relay pin for the water pump
const int RELAY_PIN = 35;

// Stepper motor pins
#define IN1 27
#define IN2 14
#define IN3 12
#define IN4 13

const int STEPS_PER_REV = 2048;
Stepper stepper(STEPS_PER_REV, IN1, IN2, IN3, IN4);

// Thresholds
const float TEMP_THRESHOLD = 34.0;
const int RAIN_THRESHOLD = 50;
const int MOISTURE_THRESHOLD = 55;

// State flag for roof position
bool roofIsOpen = false;

// Notification state flags to prevent duplicate notifications
bool highTempNotified = false;
bool heavyRainNotified = false;
bool lowMoistureNotified = false;
bool pumpActivatedNotified = false;
bool roofOpenedNotified = false;
bool roofClosedNotified = false;

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, pass);

    Serial.println("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");

    // Initialize Firebase
    config.host = FIREBASE_HOST;
    config.signer.tokens.legacy_token = FIREBASE_AUTH;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Initialize time
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

    dht.begin();

    // Initialize relay (active-low: HIGH = off)
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, HIGH); // Set the relay off by default

    // Stepper motor setup
    pinMode(IN1, OUTPUT);
    pinMode(IN2, OUTPUT);
    pinMode(IN3, OUTPUT);
    pinMode(IN4, OUTPUT);
    stepper.setSpeed(15);
    
    // Send initial system startup notification
    sendNotification("System started and connected to WiFi", "info");
}

void sendDataToFirebase(float temperature, int rain, int moisture, bool pumpStatus) {
    Firebase.setFloat(fbdo, "/sensorData/temperature", temperature);
    Firebase.setInt(fbdo, "/sensorData/rain", rain);
    Firebase.setInt(fbdo, "/sensorData/moisture", moisture);
    Firebase.setBool(fbdo, "/sensorData/pumpStatus", pumpStatus);
}

String getTimestamp() {
    struct tm timeinfo;
    if(!getLocalTime(&timeinfo)){
        Serial.println("Failed to obtain time");
        return "Time Error";
    }
    char timeStringBuff[30];
    strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(timeStringBuff);
}

void sendNotification(String message, String severity) {
    String timestamp = getTimestamp();
    String notificationPath = "/notifications/" + String(millis());
    
    Firebase.setString(fbdo, notificationPath + "/message", message);
    Firebase.setString(fbdo, notificationPath + "/severity", severity);
    Firebase.setString(fbdo, notificationPath + "/timestamp", timestamp);
    
    Serial.print("Notification sent: ");
    Serial.println(message);
}

void checkAndSendNotifications(float temperature, int rainValue, int moistureValue, bool pumpStatus) {
    // Temperature notifications
    if (temperature > TEMP_THRESHOLD && !highTempNotified) {
        sendNotification("High temperature detected: " + String(temperature) + "°C", "warning");
        highTempNotified = true;
    } else if (temperature <= TEMP_THRESHOLD && highTempNotified) {
        highTempNotified = false;
    }
    
    // Rain notifications
    if (rainValue > RAIN_THRESHOLD && !heavyRainNotified) {
        sendNotification("Heavy rain detected: " + String(rainValue) + "%", "warning");
        heavyRainNotified = true;
    } else if (rainValue <= RAIN_THRESHOLD && heavyRainNotified) {
        heavyRainNotified = false;
    }
    
    // Moisture notifications
    if (moistureValue <= MOISTURE_THRESHOLD && !lowMoistureNotified) {
        sendNotification("Low moisture detected: " + String(moistureValue) + "%", "warning");
        lowMoistureNotified = true;
    } else if (moistureValue > MOISTURE_THRESHOLD && lowMoistureNotified) {
        lowMoistureNotified = false;
    }
    
    // Pump status notifications
    if (pumpStatus && !pumpActivatedNotified) {
        sendNotification("Water pump activated", "info");
        pumpActivatedNotified = true;
    } else if (!pumpStatus && pumpActivatedNotified) {
        sendNotification("Water pump deactivated", "info");
        pumpActivatedNotified = false;
    }
}

void loop() {
    float temperature = dht.readTemperature();
    int rainValue = analogRead(RAIN_PIN);
    int moistureValue = analogRead(MOISTURE_PIN);

    rainValue = map(rainValue, 4095, 1500, 0, 100);
    rainValue = constrain(rainValue, 0, 100);

    moistureValue = map(moistureValue, 4095, 1500, 0, 100);
    moistureValue = constrain(moistureValue, 0, 100);

    Serial.print("Temperature: ");
    Serial.println(temperature);

    int speedRPM = 15;
    int stepsPerSecond = (STEPS_PER_REV * speedRPM) / 60;
    int stepsFor10Seconds = stepsPerSecond * 20;

    // 🌐 Read control mode from Firebase
    bool isManualModeOn = false;
    bool manualRoofOpen = false;
    bool manualPumpOn = false;

    if (Firebase.getBool(fbdo, "/controls/isManualModeOn")) {
        isManualModeOn = fbdo.boolData();
    }
    if (Firebase.getBool(fbdo, "/controls/isRoofOpen")) {
        manualRoofOpen = fbdo.boolData();
    }
    if (Firebase.getBool(fbdo, "/controls/isWaterPumpOn")) {
        manualPumpOn = fbdo.boolData();
    }

    // 🧠 Manual Mode Logic
    if (isManualModeOn) {
        Serial.println("Manual mode active");

        // Roof control
        if (manualRoofOpen && !roofIsOpen) {
            Serial.println("Manual command: Opening roof");
            stepper.step(stepsFor10Seconds);
            roofIsOpen = true;
            sendNotification("Roof opened manually", "info");
        } else if (!manualRoofOpen && roofIsOpen) {
            Serial.println("Manual command: Closing roof");
            stepper.step(-stepsFor10Seconds);
            roofIsOpen = false;
            sendNotification("Roof closed manually", "info");
        }

        // Pump control
        if (manualPumpOn) {
            Serial.println("Manual command: Turning ON pump");
            digitalWrite(RELAY_PIN, LOW);
        } else {
            Serial.println("Manual command: Turning OFF pump");
            digitalWrite(RELAY_PIN, HIGH);
        }

    // 🤖 Automatic Mode Logic
    } else {
        Serial.println("Automatic mode active");

        // Roof logic based on temperature or rain
        if (!isnan(temperature)) {
            if ((temperature > TEMP_THRESHOLD || rainValue > RAIN_THRESHOLD) && !roofIsOpen) {
                Serial.println("Opening roof: Temp > threshold or Rain > threshold");
                stepper.step(stepsFor10Seconds);
                roofIsOpen = true;
                
                // Send roof opened notification with reason
                if (temperature > TEMP_THRESHOLD && rainValue > RAIN_THRESHOLD) {
                    sendNotification("Roof opened automatically due to high temperature and rain", "info");
                } else if (temperature > TEMP_THRESHOLD) {
                    sendNotification("Roof opened automatically due to high temperature", "info");
                } else {
                    sendNotification("Roof opened automatically due to rain", "info");
                }
                
            } else if (temperature <= TEMP_THRESHOLD && rainValue <= RAIN_THRESHOLD && roofIsOpen) {
                Serial.println("Closing roof: Temp and Rain below threshold");
                stepper.step(-stepsFor10Seconds);
                roofIsOpen = false;
                sendNotification("Roof closed automatically as conditions normalized", "info");
            } else {
                Serial.println("No roof movement needed");
            }
        }

        // Pump logic
        Serial.print("Moisture: ");
        Serial.println(moistureValue);
        if (moistureValue <= MOISTURE_THRESHOLD) {
            Serial.println("Activating pump...");
            digitalWrite(RELAY_PIN, LOW);
        } else {
            Serial.println("Deactivating pump...");
            digitalWrite(RELAY_PIN, HIGH);
        }
    }
  
    // 🔥 Send sensor data back to Firebase
    bool pumpStatus = digitalRead(RELAY_PIN) == LOW;
    sendDataToFirebase(temperature, rainValue, moistureValue, pumpStatus);
    
    // Check conditions and send notifications
    checkAndSendNotifications(temperature, rainValue, moistureValue, pumpStatus);

    delay(1000);
}