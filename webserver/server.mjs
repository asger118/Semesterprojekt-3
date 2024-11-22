import { SerialPort, ReadlineParser } from "serialport"; // UART
import express from "express"; // NodeJS server framework
import http from "http"; // Server package
import { Server } from "socket.io"; // Websocket
import fs from "fs"; // Filesystem
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser"; // For JSON parsing

// You can now use the imported modules as needed in your code

// Global variables
const SERVER_PORT = 3000;
const UART_PORT = "/dev/ttyACM0"; // "/dev/ttyACM0"
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

// Api to get list of all plant names
app.get("/api/plants/names", (req, res) => {
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Intern server fejl");
      return;
    }
    const plants = JSON.parse(data).plants.map((plant) => plant.name);
    res.json(plants);
  });
});

// API to get list of all plants
app.get("/api/plants", (req, res) => {
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Intern server fejl");
      return;
    }
    const plants = JSON.parse(data).plants;
    res.json(plants);
  });
});

// API to get a specific plant by ID
app.get("/api/plants/:id", (req, res) => {
  const plantId = parseInt(req.params.id, 10); // Convert the ID to an integer

  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const plants = JSON.parse(data).plants;
    const plant = plants.find((p) => p.id === plantId);

    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }

    res.json(plant);
  });
});

// DELETE endpoint to remove a plant by ID
app.delete("/api/plants/delete/:id", (req, res) => {
  const plantId = parseInt(req.params.id); // Read plants from file
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Intern server fejl");
      return;
    }
    let plantsData = JSON.parse(data);
    const plantIndex = plantsData.plants.findIndex(
      (plant) => plant.id === plantId
    );
    if (plantIndex === -1) {
      res.status(404).send("Plante ikke fundet");
      return;
    } // Remove plant from array
    plantsData.plants.splice(plantIndex, 1);
    fs.writeFile(
      // Write updated data back to file
      __dirname + "/plants.json",
      JSON.stringify(plantsData, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing to plants.json:", err);
          res.status(500).send("Intern server fejl");
          return;
        }
        res.send("Plante slettet");
      }
    );
  });
});

// API to edit one plant
app.put("/api/plants/edit/:id", (req, res) => {
  const plantId = req.params.id;
  const updatedPlant = req.body;
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    let plants = JSON.parse(data).plants;
    let plantIndex = plants.findIndex(
      (plant) => plant.id === parseInt(plantId, 10)
    );
    if (plantIndex === -1) {
      res.status(404).send("Plant not found");
      return;
    } // Update the plant data
    plants[plantIndex] = { ...plants[plantIndex], ...updatedPlant }; // Write the updated plants array back to the file
    fs.writeFile(
      __dirname + "/plants.json",
      JSON.stringify({ plants: plants }, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to plants.json:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        res.json({ success: true, message: "Plant updated successfully" });
      }
    );
  });
});

// Api to handle adding a plant
app.post("/api/add_plant", (req, res) => {
  const {
    name: name,
    humidityLow: humidityLow,
    humidityHigh: humidityHigh,
    fertilizer: fertilizer,
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
    plantData.plants.push({ id, name, humidityLow, humidityHigh, fertilizer });

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
  console.log(`Bruger tilføjede planten: ${name}`);
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

//Read UART/Serial data with linebreak (\r\n) as data seperator
const parser = uart.pipe(new ReadlineParser({ delimiter: "\n" }));

let latestData;

parser.on("data", (data) => {
  console.log(data);
  latestData = data.split(","); // Data from Arduino is seperated by commas
  io.emit("plantLog", JSON.stringify(latestData)); // Send the data to all connected clients
});

let currentPlantId; // plant currently getting regulated

// Endpoint to send data to UART
app.post("/api/startLog", (req, res) => {
  const { plantID } = req.body; // Extract plantID from the request body
  currentPlantId = plantID;
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const plants = JSON.parse(data).plants;
    const plant = plants.find((p) => p.id === parseInt(plantID)); // Find the plant by ID

    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }

    // start: 1, HumidityLow, HumidityHigh, Fertilizer
    // stop: 0, HumidityLow, HumidityHigh, Fertilizer
    let message = `1,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;

    uart.write(message, (err) => {
      if (err) {
        console.error("Error writing to UART:", err);
        return res.status(500).send("Error writing to UART");
      }

      console.log(`Message sent to UART: ${message}`);
      res.status(200).send("Message sent to UART");
    });
  });
});

// Endpoint to send data to UART
app.post("/api/stopLog", (req, res) => {
  console.log("stop regulering");
  fs.readFile(__dirname + "/plants.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading plants.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const plants = JSON.parse(data).plants;
    const plant = plants.find((p) => p.id === parseInt(currentPlantId)); // Find the plant by ID

    if (!plant) {
      res.status(404).send("Plant not found");
      return;
    }

    // start: 1, HumidityLow, HumidityHigh, Fertilizer
    // stop: 0, HumidityLow, HumidityHigh, Fertilizer
    let message = `0,${plant.humidityLow},${plant.humidityHigh},${plant.fertilizer}\n`;

    uart.write(message, (err) => {
      if (err) {
        console.error("Error writing to UART:", err);
        return res.status(500).send("Error writing to UART");
      }

      console.log(`Message sent to UART: ${message}`);
      res.status(200).send("Message sent to UART");
    });
  });
});
