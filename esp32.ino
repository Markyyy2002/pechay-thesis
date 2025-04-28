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
#define DATABASE_URL "https://pechay-thesis-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define API_KEY "AIzaSyDmBWWU8biW7hZ4jn8DCFiY0D7kvOnMQJE"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

const char* ssid = "ZTE_2.4G_uXJqdF";
const char* pass = "AreY0uSurE?";

// NTP Server for timestamp
const char* ntpServer = "time.google.com";
const long  gmtOffset_sec = 28800;
const int   daylightOffset_sec = 0;

// Relay pin for the water pump
const int RELAY_PIN = 25;

// Stepper motor pins
#define IN1 27
#define IN2 14
#define IN3 12
#define IN4 13

const int STEPS_PER_REV = 2048;
Stepper stepper(STEPS_PER_REV, IN1, IN2, IN3, IN4);

// Thresholds
const float TEMP_THRESHOLD = 30.0;
const int RAIN_THRESHOLD = 30;
const int MOISTURE_THRESHOLD = 55;
const int DAY_START_HOUR = 7; // 7:00 AM
const int DAY_END_HOUR = 19; // 7:00 PM

// State flag for roof position
bool roofIsOpen = false;

// Notification state flags to prevent duplicate notifications
bool highTempNotified = false;
bool heavyRainNotified = false;
bool lowMoistureNotified = false;
bool pumpActivatedNotified = false;
bool roofOpenedNotified = false;
bool roofClosedNotified = false;

struct tm timeinfo;
bool timeInitialized = false;
bool setupCompleted = false;

unsigned long lastHistoricalStorageTime = 0;
const unsigned long HISTORY_INTERVAL = 60000; // 1 minute in milliseconds
unsigned long lastStepTime = 0;
int stepsRemaining = 0;
int stepDirection = 1;
bool needToOpenRoof = false;
bool needToCloseRoof = false;

bool openRoof = false;
bool closeRoof = false;


void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("ESP32 starting up...");
    
    // WiFi connection with timeout
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, pass);
    
    // Set a timeout for WiFi connection (30 seconds)
    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 30000) {
        delay(1000);
        Serial.print(".");
    }
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("\nFailed to connect to WiFi. Check credentials or network.");
    } else {
        Serial.println("\nConnected to WiFi");
    }
    
    // Initialize Firebase with error handling
    Serial.println("Initializing Firebase...");
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    
    // Demo user - KANI GAMITA MARK HA INIG DEMO
    auth.user.email = "panoy@gmail.com";
    auth.user.password = "123456";
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    Serial.println("Firebase initialized");
    
    // Initialize time with timeout
    Serial.println("Initializing time...");
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    
    int timeRetries = 0;
    while(!getLocalTime(&timeinfo) && timeRetries < 3) {
        Serial.println("Failed to obtain time, retrying...");
        delay(1000);
        timeRetries++;
    }
    
    if(timeRetries >= 3) {
        Serial.println("Time synchronization failed after multiple attempts");
    } else {
        Serial.println("Time synchronized successfully");
        timeInitialized = true;
    }
    
    // Initialize sensors
    Serial.println("Initializing DHT sensor...");
    dht.begin();
    
    // Initialize pins
    Serial.println("Initializing pins...");
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, HIGH);
    
    // Stepper motor setup
    pinMode(IN1, OUTPUT);
    pinMode(IN2, OUTPUT);
    pinMode(IN3, OUTPUT);
    pinMode(IN4, OUTPUT);
    stepper.setSpeed(15);
    
    // Send initial system startup notification
    Serial.println("Sending startup notification...");
    sendNotification("System started and connected to WiFi", "info");
    
    Serial.println("Setup completed!");
    setupCompleted = true;
}

void sendDataToFirebase(float temperature, float humidity, int rain, int moisture, bool pumpStatus) {
    if (!Firebase.ready()) {
        Serial.println("Firebase not ready, skipping data upload");
        return;
    }
    
    if (Firebase.setFloat(fbdo, "/sensorData/temperature", temperature)) {
        Serial.println("Temperature data sent");
    } else {
        Serial.print("Temperature data failed: ");
        Serial.println(fbdo.errorReason());
    }

    if(Firebase.setFloat(fbdo, "/sensorData/humidity", humidity)) {
        Serial.println("Humidity data sent");
    } else {
        Serial.print("Humidity data failed: ");
        Serial.println(fbdo.errorReason());
    }
    
    if (Firebase.setInt(fbdo, "/sensorData/rain", rain)) {
        Serial.println("Rain data sent");
    } else {
        Serial.print("Rain data failed: ");
        Serial.println(fbdo.errorReason());
    }
    
    if (Firebase.setInt(fbdo, "/sensorData/moisture", moisture)) {
        Serial.println("Moisture data sent");
    } else {
        Serial.print("Moisture data failed: ");
        Serial.println(fbdo.errorReason());
    }
    
    if (Firebase.setBool(fbdo, "/sensorData/pumpStatus", pumpStatus)) {
        Serial.println("Pump status sent");
    } else {
        Serial.print("Pump status failed: ");
        Serial.println(fbdo.errorReason());
    }

    unsigned long currentTime = millis();
    if (currentTime - lastHistoricalStorageTime >= HISTORY_INTERVAL) {
        Serial.println("Storing hourly historical data...");
        
        time_t epochTime;
        time(&epochTime);
        
        String historyPath = "/hourly_history/" + String(epochTime);
        
        Serial.print("Storing historical data at path: ");
        Serial.println(historyPath);
    
        String readableTimestamp = getTimestamp();
    
        FirebaseJson json;
        json.set("temperature", temperature);
        json.set("humidity", humidity);
        json.set("rain", rain);
        json.set("moisture", moisture);
        json.set("pumpStatus", pumpStatus);
        json.set("readableTime", readableTimestamp);
    
        if (Firebase.setJSON(fbdo, historyPath, json)) {
            Serial.println("Historical data stored successfully");
        } else {
            Serial.print("Historical data storage failed: ");
            Serial.println(fbdo.errorReason());
        }

        lastHistoricalStorageTime = currentTime;
    }
}

String getTimestamp() {
    if(!getLocalTime(&timeinfo)){
        Serial.println("Failed to obtain time");
        return "Time Error";
    }
    timeInitialized = true;
    char timeStringBuff[30];
    strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(timeStringBuff);
}

void sendNotification(String message, String severity) {
    if (!Firebase.ready()) {
        Serial.println("Firebase not ready yet, cannot send notifications");
        return;
    }

    String timestamp = getTimestamp();
    String notificationPath = "/notifications/" + String(millis());
    
    Serial.print("Sending notification: ");
    Serial.println(message);
    
    if (Firebase.setString(fbdo, notificationPath + "/message", message)) {
        Serial.println("Message sent successfully");
    } else {
        Serial.print("Message sending failed: ");
        Serial.println(fbdo.errorReason());
    }
    
    if (Firebase.setString(fbdo, notificationPath + "/severity", severity)) {
        Serial.println("Severity sent successfully");
    } else {
        Serial.print("Severity sending failed: ");
        Serial.println(fbdo.errorReason());
    }
    
    if (Firebase.setString(fbdo, notificationPath + "/timestamp", timestamp)) {
        Serial.println("Timestamp sent successfully");
    } else {
        Serial.print("Timestamp sending failed: ");
        Serial.println(fbdo.errorReason());
    }
}

void checkAndSendNotifications(float temperature, float humidity, int rainValue, int moistureValue, bool pumpStatus) {
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
    Serial.println("\n--- Loop Start ---");
    
    // Check if setup completed successfully
    if (!setupCompleted) {
        Serial.println("Setup did not complete successfully. Retrying...");
        setup();
        delay(5000);
        return;
    }

    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost. Reconnecting...");
        WiFi.reconnect();
        delay(5000);
        return;
    } else {
        Serial.println("WiFi connected");
    }

    // Check Firebase connection
    if (!Firebase.ready()) {
        Serial.println("Firebase not ready, attempting to reconnect...");
        Firebase.begin(&config, &auth);
        delay(1000);
    } else {
        Serial.println("Firebase ready");
    }

    // Read sensor data with error checking
    Serial.println("Reading sensors...");
    
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("Failed to read readings from DHT sensor!");
        temperature = 0;
        humidity = 0;
    } else {
        Serial.print("Temperature: ");
        Serial.println(temperature);
        Serial.print("Humidity: ");
        Serial.println(humidity);
    }
    
    int rainValue = analogRead(RAIN_PIN);
    Serial.print("Rain raw value: ");
    Serial.println(rainValue);
    
    rainValue = map(rainValue, 4095, 1500, 0, 100);
    rainValue = constrain(rainValue, 0, 100);
    Serial.print("Rain mapped value: ");
    Serial.println(rainValue);

    int moistureValue = analogRead(MOISTURE_PIN);
    Serial.print("Moisture raw value: ");
    Serial.println(moistureValue);
    
    moistureValue = map(moistureValue, 4095, 2048, 0, 100);
    moistureValue = constrain(moistureValue, 0, 100);
    Serial.print("Moisture mapped value: ");
    Serial.println(moistureValue);

    int speedRPM = 15;
    int stepsPerSecond = (STEPS_PER_REV * speedRPM) / 60;
    int stepsFor10Seconds = stepsPerSecond * 20;

    // Read control mode from Firebase with error handling
    Serial.println("Reading control settings from Firebase...");
    bool isManualModeOn = false;
    bool manualRoofOpen = false;
    bool manualPumpOn = false;

    if (Firebase.getBool(fbdo, "/controls/isManualModeOn")) {
        isManualModeOn = fbdo.boolData();
        Serial.print("Manual mode: ");
        Serial.println(isManualModeOn ? "ON" : "OFF");
    } else {
        Serial.println("Failed to read manual mode setting");
    }
    
    if (Firebase.getBool(fbdo, "/controls/isRoofOpen")) {
        manualRoofOpen = fbdo.boolData();
        Serial.print("Manual roof setting: ");
        Serial.println(manualRoofOpen ? "OPEN" : "CLOSED");
    } else {
        Serial.println("Failed to read roof setting");
    }
    
    if (Firebase.getBool(fbdo, "/controls/isWaterPumpOn")) {
        manualPumpOn = fbdo.boolData();
        Serial.print("Manual pump setting: ");
        Serial.println(manualPumpOn ? "ON" : "OFF");
    } else {
        Serial.println("Failed to read pump setting");
    }

    // Control logic with more debug output
    if (isManualModeOn) {
        Serial.println("Manual mode active");

        // Roof control
        if (manualRoofOpen && !roofIsOpen && stepsRemaining == 0) {
            Serial.println("Manual command: Opening roof");
            needToOpenRoof = true;
        } else if (!manualRoofOpen && roofIsOpen && stepsRemaining == 0) {
            Serial.println("Manual command: Closing roof");
            needToCloseRoof = true;
        } else {
            Serial.println("No roof movement needed");
        }

        // Pump control
        if (manualPumpOn) {
            Serial.println("Manual command: Turning ON pump");
            digitalWrite(RELAY_PIN, LOW);
        } else {
            Serial.println("Manual command: Turning OFF pump");
            digitalWrite(RELAY_PIN, HIGH);
        }
    } else {
        Serial.println("Automatic mode active");

        if(!getLocalTime(&timeinfo)){
            Serial.println("Failed to obtain time");
            // return;
        } else {
            int currentHour = timeinfo.tm_hour;
            Serial.print("Current hour: ");
            Serial.println(currentHour);

            // Day/Night roof control
            if(currentHour >= DAY_START_HOUR && currentHour < DAY_END_HOUR) {
                if(!roofIsOpen && rainValue <= RAIN_THRESHOLD && stepsRemaining == 0) {
                    Serial.println("Opening roof: Day time");
                    needToOpenRoof = true;
                }
            } else {
                if(roofIsOpen && stepsRemaining == 0) {
                    Serial.println("Closing roof: Night time");
                    needToCloseRoof = true;
                }
            }
    
            // Roof logic based on temperature or rain
            if (!isnan(temperature)) {
                if ((temperature > TEMP_THRESHOLD || rainValue > RAIN_THRESHOLD) && !roofIsOpen && stepsRemaining == 0) {
                    Serial.println("Opening roof: Temp > threshold or Rain > threshold");
                    needToOpenRoof = true;
                    
                } else if (temperature <= TEMP_THRESHOLD && rainValue <= RAIN_THRESHOLD && roofIsOpen && stepsRemaining == 0) {
                    int currentHour = timeinfo.tm_hour;
                    if (currentHour < DAY_START_HOUR || currentHour >= DAY_END_HOUR) {
                        Serial.println("Closing roof: Temp and Rain below threshold");
                        needToCloseRoof = true;
                    } else {
                        Serial.println("Keeping roof open during daytime despite normal conditions");
                    }
                } else {
                    Serial.println("No roof movement needed");
                }
            }
        }

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
  
    // Send sensor data back to Firebase
    bool pumpStatus = digitalRead(RELAY_PIN) == LOW;
    Serial.print("Pump status: ");
    Serial.println(pumpStatus ? "ON" : "OFF");
    
    sendDataToFirebase(temperature, humidity, rainValue, moistureValue, pumpStatus);
    
    Serial.println("Checking notification conditions...");
    checkAndSendNotifications(temperature, humidity, rainValue, moistureValue, pumpStatus);

    if(needToOpenRoof && stepsRemaining == 0) {
        stepsRemaining = stepsFor10Seconds;
        stepDirection = 1;
        needToOpenRoof = false;
        Serial.println("Starting to open the roof");    
    } else if (needToCloseRoof && stepsRemaining == 0) {
        stepsRemaining = stepsFor10Seconds;
        stepDirection = -1;
        needToCloseRoof = false;
        Serial.println("Starting to close the roof");
    }

    if(stepsRemaining > 0) {
        unsigned long currentMillis = millis();
        if(currentMillis - lastStepTime >= 2) {
            stepper.step(stepDirection * 10);
            stepsRemaining -= 10;
            lastStepTime = currentMillis;

            if(stepsRemaining <= 0) {
                stepsRemaining = 0;
                roofIsOpen = (stepDirection > 0); 

                if(roofIsOpen) {
                    if(isManualModeOn) {
                        sendNotification("Roof opened manually", "info");
                    } else if (temperature > TEMP_THRESHOLD && rainValue > RAIN_THRESHOLD) {
                        sendNotification("Roof opened due to high temperature or rain", "info");
                    } else if (temperature > TEMP_THRESHOLD) {
                        sendNotification("Roof opened due to high temperature", "info");
                    } else if (rainValue > RAIN_THRESHOLD) {
                        sendNotification("Roof opened due to heavy rain", "info");
                    } else {
                        sendNotification("Roof opened automatically", "info");
                    }
                } else {
                    int currentHour = timeinfo.tm_hour;
                    if (currentHour < DAY_START_HOUR || currentHour >= DAY_END_HOUR) {
                        sendNotification("Roof closed automatically during nighttime", "info");
                    } else {
                        sendNotification("Roof closed automatically", "info");
                    }
                }
                Serial.println(roofIsOpen ? "Roof is now open" : "Roof is now closed");
            }
        }
    }

    Serial.println("--- Loop End ---");
    Serial.println("Waiting 1 second before next cycle...");
    delay(1000);
}