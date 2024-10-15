import { SerialPort, ReadlineParser } from "serialport"; // UART
import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Gpio } from "onoff"; // GPIO control
import { Server } from "socket.io"; // Websocket
import fs from "fs"; // Filesystem
import { dirname } from "path";
import { fileURLToPath } from "url";

// Gloabl variables
const SERVER_PORT = 3000;
const UART_PORT = "/dev/ttyAMA0";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create an HTTP server
const app = express();
const server = http.createServer(app);

// Middleware to log visits
app.use((req, res, next) => {
  console.log(`Visitor accessed: ${req.url}`);
  next();
});

// Define the route to serve the HTML page
app.use(express.static(__dirname + "/public"));

// Start the HTTP server
app.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});

// Setup UART communication
const uart = new SerialPort({
  path: UART_PORT,
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
});
