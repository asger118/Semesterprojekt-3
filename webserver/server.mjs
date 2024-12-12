import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Server } from "socket.io"; // Websocket
import { dirname } from "path";
import { fileURLToPath } from "url";
import { DatabaseCommunicator } from "./Database/DatabaseCommunicator.js"; // Database

// Global variables
const SERVER_PORT = 3000; // Server port
const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup database
let databaseCom = new DatabaseCommunicator();
await databaseCom.SetupDatabase();

// Create an HTTP server
const app = express();
const server = http.createServer(app);
// Create a WebSocket server attached to the HTTP server
const io = new Server(server);

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse plain text bodies
app.use(express.text());

// Route to static files
app.use(express.static(__dirname + "/public"));

// Add plant page route
app.get("/add_plant", (req, res) => {
  res.sendFile(__dirname + "/public/pages/add_plant.html");
});

// Admin plant page route
app.get("/admin_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/admin_page.html");
});

// Admin plant page route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/pages/admin_page.html");
});

// Data page route
app.get("/log_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/log_page.html");
});

// Edit page route
app.get("/edit_page/:id", (req, res) => {
  res.sendFile(__dirname + "/public/pages/edit_plant.html");
});

// Start log page route
app.get("/startLog_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/index.html");
});

// Rest-API to get list of all plants
app.get("/api/plants", async (req, res) => {
  try {
    // Get all plants from database
    const plants = await databaseCom.getAllSettings();
    // Insert plants into respons body to client
    res.json(plants);
  } catch (error) {
    // Create error message in case of failure
    res.status(500).send("Error retrieving plants");
  }
});

// Rest-API to get a specific plant by ID
app.get("/api/plants/:id", async (req, res) => {
  // Convert the ID to an integer
  const plantId = parseInt(req.params.id, 10);
  try {
    // Get specific plant from database
    const plant = await databaseCom.getSettingById(plantId);
    // Check if plant with id existed
    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }
    // Set plant into respons body for client
    res.json(plant);
  } catch (error) {
    // Error message in case of failure
    res.status(500).send("Error retrieving plant");
  }
});

// Rest-API DELETE endpoint to remove a plant by ID
app.delete("/api/plants/delete/:id", async (req, res) => {
  // Convert the ID to an integer
  const plantId = parseInt(req.params.id, 10);
  try {
    // Delete plant in database
    await databaseCom.deleteSetting(plantId);
    // Send succes message to client
    res.send("Planten er slettet!");
  } catch (error) {
    // Send failure message to client
    res.status(500).send("Error deleting plant");
  }
});

// Rest-API to edit one plant
app.put("/api/plants/edit/:id", async (req, res) => {
  // Extract plant id from URL
  const plantId = req.params.id;
  // Extract plant details from request body
  const updatedPlant = req.body;
  try {
    // Update plant details in database
    await databaseCom.updateSettingById(plantId, updatedPlant);
    // Create succes message
    res.json({ success: true, message: "plant updated succesefully" });
  } catch (error) {
    // create failure message in case of error
    res.status(500).send("Error editing plant");
  }
});

// Rest-API to handle adding a plant
app.post("/api/add_plant", async (req, res) => {
  // Extract plant details from request body
  const { name, humidityLow, humidityHigh, fertilizer } = req.body;
  try {
    // Create plant object
    const setting = { name, humidityLow, humidityHigh, fertilizer };
    // Create plant in database with object
    await databaseCom.addSetting(setting);
    // Create succes message
    res
      .status(200)
      .json({ success: true, message: "Plant added successfully" });
  } catch (error) {
    // Create error message
    console.error("Error adding plant:", error);
    res.status(500).json({ success: false, message: "Error adding plant" });
  }
});

// Rest-API to update log
app.get("/api/updateLog", async (req, res) => {
  try {
    // Get all logs from database related to specific plant
    let logs = await databaseCom.getLogById(currentPlantId);
    // Create succes message
    res.status(200).json(logs);
  } catch (error) {
    // Print and create error message
    console.error("Error updating graph:", error);
    res.status(500).json({ success: false, message: "Error updating graph" });
  }
});

// Start the HTTP server
server.listen(SERVER_PORT, () => {
  // Output to terminal wich URL and port server is running on
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});

// Id of plant currently being regulated
let currentPlantId;
// Message with plant details currently being regulated
let message = "0,0,0,0\n";

// Rest-API endpoint to set message up for regulation
app.post("/api/startLog", async (req, res) => {
  // Extract plantID from the request body
  const { plantID } = req.body;
  // Set plant to be regulated
  currentPlantId = plantID;

  try {
    // Get plant details from database
    const plant = await databaseCom.getSettingById(parseInt(plantID, 10));

    // Chech if plant exist
    if (!plant) {
      console.log("/api/startLog: Plant not found");
      res.status(404).send("Plant not found");
      return;
    }
    // Message types for PSoC
    //    Start: 1, HumidityLow, HumidityHigh, Fertilizer
    //    Stop: 0, HumidityLow, HumidityHigh, Fertilizer
    message = `1,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;
    console.log("Start log message: " + message);
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

// Rest-API endpoint to set message up for no regulation
app.post("/api/stopLog", async (req, res) => {
  try {
    // Get specific plant from database
    const plant = await databaseCom.getSettingById(
      parseInt(currentPlantId, 10)
    );
    // Check if plant exist
    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }

    // Message types for PSoC
    //    Start: 1, HumidityLow, HumidityHigh, Fertilizer
    //    Stop: 0, HumidityLow, HumidityHigh, Fertilizer
    message = `0,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

// Endpoint for Wi-Fi modul to get plant details
app.get("/api/data", (req, res) => {
  // send message
  res.status(200).send(message);
});

// Endpoint for PSoC to send data from sensors
app.post("/api/data", async (req, res) => {
  // Extract sensor readings
  const data = req.body;
  // Output reading to terminal on server
  console.log(`Got data: \x1b[32m${data}\x1b[0m`);
  try {
    // Split data into seperate variables
    const [humidity, waterlevel, fertilizer, conductivity] = data.split(",");
    // Create object with sensor data
    const plantLog = {
      id: parseFloat(currentPlantId),
      humidity: parseFloat(humidity),
      waterlevel: parseFloat(waterlevel),
      fertilization: parseFloat(fertilizer),
      conductivity: parseFloat(conductivity),
    };
    // Send message to all client via websocket that new sensor data is available
    io.emit("plantLog", plantLog);
    // Save the sensor data in database
    await databaseCom.saveLog(plantLog);
  } catch {
    // Create error message
    (error) => {
      console.error("/api/data err: " + error);
    };
  }
  // Create succes message
  res.status(200).send("Got sensor data OK!");
});
