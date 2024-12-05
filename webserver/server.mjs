import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Server } from "socket.io"; // Websocket
import { dirname } from "path";
import { fileURLToPath } from "url";
import { getPlants, getPlantById } from "./functions/func.mjs";
import { DatabaseCommunicator } from "./Database/DatabaseCommunicator.js";

// Global variables
const SERVER_PORT = 3000;
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

// Add plant page api
app.get("/add_plant", (req, res) => {
  res.sendFile(__dirname + "/public/pages/add_plant.html");
});

// Admin plant page api
app.get("/admin_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/admin_page.html");
});

// Admin plant page api
app.get("/", (req, res) => {
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

// Start log page api
app.get("/startLog_page", (req, res) => {
  res.sendFile(__dirname + "/public/pages/index.html");
});

// API to get list of all plants
app.get("/api/plants", async (req, res) => {
  try {
    //const plants = await getPlants();
    const plants = await databaseCom.getAllSettings();
    res.json(plants);
  } catch (error) {
    res.status(500).send("Error retrieving plants");
  }
});

// API to get a specific plant by ID
app.get("/api/plants/:id", async (req, res) => {
  const plantId = parseInt(req.params.id, 10); // Convert the ID to an integer
  try {
    const plant = await databaseCom.getSettingById(plantId);
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
    console.log(plantId);
    await databaseCom.deleteSetting(plantId);
    res.send("Planten er slettet!");
  } catch (error) {
    res.status(500).send("Error deleting plant");
  }
});

// API to edit one plant
app.put("/api/plants/edit/:id", async (req, res) => {
  const plantId = req.params.id;
  const updatedPlant = req.body;
  try {
    await databaseCom.updateSettingById(plantId, updatedPlant);
    res.json({ success: true, message: "plant updated succesefully" });
  } catch (error) {
    res.status(500).send("Error editing plant");
  }
});

// API to handle adding a plant
app.post("/api/add_plant", async (req, res) => {
  const { name, humidityLow, humidityHigh, fertilizer } = req.body;
  try {
    // await addPlant(name, humidityLow, humidityHigh, fertilizer);
    const setting = { name, humidityLow, humidityHigh, fertilizer };
    await databaseCom.addSetting(setting);
    res
      .status(200)
      .json({ success: true, message: "Plant added successfully" });
  } catch (error) {
    console.error("Error adding plant:", error);
    res.status(500).json({ success: false, message: "Error adding plant" });
  }
});

// Start the HTTP server
server.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});

let currentPlantId; // Plant currently being regulated
let message = "0,0,0,0\n";

// Endpoint to send data to UART
app.post("/api/startLog", async (req, res) => {
  const { plantID } = req.body; // Extract plantID from the request body
  currentPlantId = plantID;

  try {
    const plant = await getPlantById(parseInt(plantID, 10));

    if (!plant) {
      console.log("/api/startLog: Plant not found");
      res.status(404).send("Plant not found");
      return;
    }

    // Start: 1, HumidityLow, HumidityHigh, Fertilizer
    // Stop: 0, HumidityLow, HumidityHigh, Fertilizer
    message = `1,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;
    console.log("Start log message: " + message);
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
    message = `0,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;
  } catch (error) {
    res.status(500).send("Error processing request");
  }
});

app.get("/api/data", (req, res) => {
  res.status(200).send(message);
  console.log(`Data send: ${message}`);
});

app.post("/api/data", async (req, res) => {
  const data = req.body;
  console.log(`Got data: \x1b[32m${data}\x1b[0m`);
  try {
    const [humidity, waterlevel, fertilizer, conductivity] = data.split(",");
    const plantLog = {
      id: parseFloat(currentPlantId),
      humidity: parseFloat(humidity),
      waterlevel: parseFloat(waterlevel),
      fertilization: parseFloat(fertilizer),
      conductivity: parseFloat(conductivity),
    };
    io.emit("plantLog", plantLog);
    await databaseCom.saveLog(plantLog);
  } catch {
    (error) => {
      console.error("/api/data err: " + error);
    };
  }

  res.status(200).send("Good job brormand");
});
