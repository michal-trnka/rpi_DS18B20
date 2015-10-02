
# Enabling sensor on rpi
follow the instructions on https://github.com/burrsutter/rpi_DS18B20

# Mock sensor
There is file restClientMock.js allowing to mock the sensor on any computer. It just sends random data to the hub.

# Start transmitting data to hub
run the command:

	node restClient.js

in case you don't have required hardware, run the command:

	node restClientMock.js
