import { SerialPort, ReadlineParser } from "serialport"; // UART
import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Gpio } from "onoff"; // GPIO control
import { Server } from "socket.io"; // Websocket
import fs from "fs"; // Filesystem

// Gloabl variables
const SERVER_PORT = 3000;
const UART_PORT = "/dev/ttyAMA0";

// Create an HTTP server
const app = express();
const server = http.createServer(app);

// Define the route to serve the HTML page
app.use(express.static(__dirname + "/public"));

// Start the HTTP server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Setup UART communication
const uart = new SerialPort({
  path: UART_PORT,
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
});
