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
/*
app.use((req, res, next) => {
  console.log(`User accessed: ${req.url}`);
  next();
});
*/

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to static files
app.use(express.static(__dirname + "/public"));

// Add plant page api
app.get("/add_plant", (req, res) => {
  res.sendFile(__dirname + "/public/pages/add_plant.html");
});

// Data page api
app.get("/data_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/data_page.html");
});

// Home page api
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/pages/index.html");
});

// Api to get list of all plant names
app.get("/api/plants", (req, res) => {
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const plants = JSON.parse(data).plants.map((plant) => plant.name);
    res.json(plants);
  });
});

// Api to handle adding a plant
app.post("/api/add_plant", (req, res) => {
  const {
    name: name,
    humidityLow: humidityLow,
    humidityHigh: humidityHigh,
  } = req.body;

  // Read the existing data from the file
  fs.readFile("plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      res.json({ success: false });
      return;
    }

    // Parse the existing JSON data
    const plantData = JSON.parse(data);

    // Determine the new ID
    let id = 1;
    if (plantData.plants.length > 0) {
      const lastPlant = plantData.plants[plantData.plants.length - 1];
      id = lastPlant.id + 1;
    }

    // Add the new plant to the array
    plantData.plants.push({ id, name, humidityLow, humidityHigh });

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
  console.log(`User added plant: ${name}`);
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
