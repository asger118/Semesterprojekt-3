import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plantsFilePath = path.join(__dirname, "../plants.json");

function getPlants() {
  return new Promise((resolve, reject) => {
    fs.readFile(plantsFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading plants.json:", err);
        reject("Intern server fejl");
        return;
      }
      resolve(JSON.parse(data).plants);
    });
  });
}

async function addPlant(name, humidityLow, humidityHigh, fertilizer) {
  const plants = await getPlants();
  let id = 1;
  if (plants.length > 0) {
    const lastPlant = plants[plants.length - 1];
    id = lastPlant.id + 1;
  }
  plants.push({ id, name, humidityLow, humidityHigh, fertilizer });

  const editedPlants = JSON.stringify({ plants }, null, 2);
  fs.writeFile(plantsFilePath, editedPlants, (err) => {
    if (err) {
      console.error("Error writing plants.json:", err);
    }
  });
}

async function getPlantById(id) {
  const plants = await getPlants();
  return plants.find((plant) => plant.id === id);
}

async function deletePlantById(id) {
  const plants = await getPlants();
  const plantIndex = plants.findIndex((plant) => plant.id === id);
  if (plantIndex < 0) {
    return "Plante ikke fundet";
  }
  plants.splice(plantIndex, 1);
  const editedPlants = JSON.stringify({ plants }, null, 2);
  fs.writeFile(plantsFilePath, editedPlants, (err) => {
    if (err) {
      console.error("Error writing plants.json:", err);
    }
  });

  return "Plante slettet";
}

async function editPlantById(id, updatedPlant) {
  const plants = await getPlants();
  let plantIndex = plants.findIndex((plant) => plant.id === parseInt(id, 10));

  if (plantIndex === -1) {
    return "Plant not found";
  }

  plants[plantIndex] = { ...plants[plantIndex], ...updatedPlant };

  const editedPlants = JSON.stringify({ plants }, null, 2);
  fs.writeFile(plantsFilePath, editedPlants, "utf8", (err) => {
    if (err) {
      console.error("Error writing plants.json:", err);
    }
  });
  return "Plant updated successfully";
}

export { getPlants, getPlantById, deletePlantById, editPlantById, addPlant };
