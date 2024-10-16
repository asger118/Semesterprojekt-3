import { SerialPort, ReadlineParser } from "serialport"; // UART
import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Gpio } from "onoff"; // GPIO control
import { Server } from "socket.io"; // Websocket
import fs from "fs"; // Filesystem
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser"; // For JSON parsing

// Global variables
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

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the route to serve the HTML page
app.use(express.static(__dirname + "/public"));

// Define additional routes for different HTML pages
app.get("/add_plant", (req, res) => {
  res.sendFile(__dirname + "/public/add_plant.html");
});

// New route to handle adding a plant
app.post("/add_plant", (req, res) => {
  const { plant_name: name, soil_humidity: soilHumidity } = req.body; // Correctly reference fields from form

  // Read the existing data from the file
  fs.readFile("plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      res.json({ success: false });
      return;
    }

    // Parse the existing JSON data
    const plantData = JSON.parse(data);

    // Add the new plant to the array
    plantData.plants.push({ name, soilHumidity });

    // Write the updated data back to the file
    fs.writeFile("plants.json", JSON.stringify(plantData, null, 2), (err) => {
      if (err) {
        console.error("Error writing the file:", err);
        res.json({ success: false });
        return;
      }
      res.json({ success: true });
    });
  });
});

// Start the HTTP server
server.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});

// Setup UART communication
const uart = new SerialPort({
  path: UART_PORT,
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
});
