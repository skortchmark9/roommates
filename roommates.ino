#define NUM_ROOMMATES 7
#define DATE_BUF_LENGTH NUM_ROOMMATES * 21
int lightPins[] = {D1, D2, D3, D4, D5, D6, D7};
int buttonPins[] = {A1, A2, A3, A4, A5, A6, A7};
double debounceTimes[] = {0,0,0,0,0,0,0};
int debounceDelay = 300;

int roommates = 127; // 0x7F 0111 1111


char dates[DATE_BUF_LENGTH] = ", , , , , , , ";

void setup() {
    for(int i = 0; i < NUM_ROOMMATES; i++) {
        pinMode(lightPins[i], OUTPUT);
        pinMode(buttonPins[i], INPUT);
    }

   Particle.function("led",serverLedToggle);
   Particle.variable("roommates", roommates);
   Particle.variable("dates", dates);
   Particle.syncTime();
   Time.zone(-4);
   
   Serial.begin(9600);
  
}



void loop() {
    createLight();
    checkButtons();
}

void createLight() {
    for(int i = 0; i < NUM_ROOMMATES; i++) {
        digitalWrite(lightPins[i], roommates & (1 << i));
    }
}

void checkButtons() {
    for(int i = 0; i < NUM_ROOMMATES; i++) {
        double lastDebounceTime = debounceTimes[i];
        if (digitalRead(buttonPins[i])) {
            if (lastDebounceTime != 0) {
                if ((millis() - lastDebounceTime) > debounceDelay) {
                    ledToggle(i);
                    debounceTimes[i] = 0;
                }
            } else {
                debounceTimes[i] = millis();
            }
        } else {
            debounceTimes[i] = 0;
        }
    }
}

void spliceDate(int idx, String dateStr) {
    char * token;
    String newDates = "";

    int i = 0;
    token = strtok (dates, ",");
    while (token != NULL && i < NUM_ROOMMATES) {
        if (i == idx) {
            newDates += dateStr;
        } else {
            newDates += token;
        }
        newDates += ',';
        i++;
        token = strtok(NULL, ",");
    }

    for(int i = 0; i < DATE_BUF_LENGTH; i++) {
        dates[i] = NULL;
    }
    newDates.toCharArray(dates, newDates.length());
}

int ledToggle(int number) {
    if (number > NUM_ROOMMATES - 1) {
        return -1;
    } else {
        roommates ^= (1 << number);
        spliceDate(number, Time.format(Time.now(), TIME_FORMAT_ISO8601_FULL));

        return roommates & 1 << number;
    }
}

int serverLedToggle(String command) {
    /* Spark.functions always take a string as an argument and return an integer.
    Since we can pass a string, it means that we can give the program commands on how the function should be used.
    In this case, telling the function "on" will turn the LED on and telling it "off" will turn the LED off.
    Then, the function returns a value to us to let us know what happened.
    In this case, it will return 1 for the LEDs turning on, 0 for the LEDs turning off,
    and -1 if we received a totally bogus command that didn't do anything to the LEDs.
    */
    int number = atoi(command);
    return ledToggle(number);
}
