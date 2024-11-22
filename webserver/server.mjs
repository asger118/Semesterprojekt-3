import { SerialPort, ReadlineParser } from "serialport"; // UART
import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Server } from "socket.io"; // Websocket
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser"; // For JSON parsing
import {
  getPlants,
  getPlantById,
  deletePlantById,
  editPlantById,
  addPlant,
} from "./functions/func.mjs";

// Global variables
const SERVER_PORT = 3000;
const UART_PORT = "/dev/ttyAMA0"; // "/dev/ttyACM0"
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create an HTTP server
const app = express();
const server = http.createServer(app);
// Create a WebSocket server attached to the HTTP server
const io = new Server(server);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to static files
app.use(express.static(__dirname + "/public"));

// Add plant page api
app.get("/add_plant", (req, res) => {
  res.sendFile(__dirname + "/public/pages/add_plant.html");
});

// Admin plant page api
app.get("/admin_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/admin_page.html");
});

// Data page api
app.get("/log_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/log_page.html");
});

// Edit page api
app.get("/edit_page/:id", (req, res) => {
  res.sendFile(__dirname + "/public/pages/edit_plant.html");
});

// Home page api
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/pages/index.html");
});

// API to get list of all plants
app.get("/api/plants", async (req, res) => {
  try {
    const plants = await getPlants();
    res.json(plants);
  } catch (error) {
    res.status(500).send("Error retrieving plants");
  }
});

// API to get a specific plant by ID
app.get("/api/plants/:id", async (req, res) => {
  const plantId = parseInt(req.params.id, 10); // Convert the ID to an integer
  try {
    const plant = await getPlantById(plantId);
    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }
    res.json(plant);
  } catch (error) {
    res.status(500).send("Error retrieving plant");
  }
});

// DELETE endpoint to remove a plant by ID
app.delete("/api/plants/delete/:id", async (req, res) => {
  const plantId = parseInt(req.params.id, 10); // Convert the ID to an integer
  try {
    const statusMessage = await deletePlantById(plantId);
    res.send(statusMessage);
  } catch (error) {
    res.status(500).send("Error deleting plant");
  }
});

// API to edit one plant
app.put("/api/plants/edit/:id", async (req, res) => {
  const plantId = req.params.id;
  const updatedPlant = req.body;
  try {
    const statusMessage = await editPlantById(plantId, updatedPlant);
    res.json({ success: true, message: statusMessage });
  } catch (error) {
    res.status(500).send("Error editing plant");
  }
});

// API to handle adding a plant
app.post("/api/add_plant", async (req, res) => {
  const { name, humidityLow, humidityHigh, fertilizer } = req.body;
  try {
    await addPlant(name, humidityLow, humidityHigh, fertilizer);
    res.status(201).send("Plant added successfully");
  } catch (error) {
    res.status(500).send("Error adding plant");
  }
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

// Read UART/Serial data with linebreak (\r\n) as data separator
const parser = uart.pipe(new ReadlineParser({ delimiter: "\n" }));

let latestData;

parser.on("data", (data) => {
  console.log(data);
  latestData = data.split(","); // Data from Arduino is separated by commas
  io.emit("plantLog", JSON.stringify(latestData)); // Send the data to all connected clients
});

let currentPlantId; // Plant currently being regulated

// Endpoint to send data to UART
app.post("/api/startLog", async (req, res) => {
  const { plantID } = req.body; // Extract plantID from the request body
  currentPlantId = plantID;

  try {
    const plants = await getPlants();
    const plant = plants.find((p) => p.id === parseInt(plantID, 10)); // Find the plant by ID

    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }

    // Start: 1, HumidityLow, HumidityHigh, Fertilizer
    // Stop: 0, HumidityLow, HumidityHigh, Fertilizer
    const message = `1,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;

    uart.write(message, (err) => {
      if (err) {
        console.error("Error writing to UART:", err);
        res.status(500).send("Error writing to UART");
        return;
      }

      console.log(`Message sent to UART: ${message}`);
      res.status(200).send("Message sent to UART");
    });
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

// Endpoint to send data to UART
app.post("/api/stopLog", async (req, res) => {
  try {
    const plants = await getPlants();
    const plant = plants.find((p) => p.id === parseInt(currentPlantId, 10)); // Find the plant by ID

    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }

    // Start: 1, HumidityLow, HumidityHigh, Fertilizer
    // Stop: 0, HumidityLow, HumidityHigh, Fertilizer
    const message = `0,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;

    uart.write(message, (err) => {
      if (err) {
        console.error("Error writing to UART:", err);
        res.status(500).send("Error writing to UART");
        return;
      }

      console.log(`Message sent to UART: ${message}`);
      res.status(200).send("Message sent to UART");
    });
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});
