// Ensure your DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", () => {
  fetchPlants();
});

async function fetchPlants() {
  try {
    const response = await fetch("/api/plants");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const plantNames = await response.json();
    populateTable(plantNames);
  } catch (error) {
    console.error("Failed to fetch plant data:", error);
  }
}

function populateTable(plants) {
  const tbody = document.querySelector("#plantTable tbody");
  plants.forEach((plant) => {
    const row = document.createElement("tr");

    // Creating cells for each column
    const nameCell = document.createElement("td");
    nameCell.textContent = plant.name;
    row.appendChild(nameCell);

    const humidityLowCell = document.createElement("td");
    humidityLowCell.textContent = plant.humidityLow;
    row.appendChild(humidityLowCell);

    const humidityHighCell = document.createElement("td");
    humidityHighCell.textContent = plant.humidityHigh;
    row.appendChild(humidityHighCell);

    const editCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => editPlant(plant.id);
    editCell.appendChild(editButton);
    row.appendChild(editCell);

    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deletePlant(plant.id);
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    tbody.appendChild(row);
  });
}

function deletePlant(id) {
  if (confirm("Are you sure you want to delete this plant?")) {
    fetch(`/api/plants/delete/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete plant");
        }
        return response.text();
      })
      .then((message) => {
        // Optionally, refresh the table to reflect the changes
        location.reload();
        alert(message);
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while deleting the plant");
      });
  }
}
