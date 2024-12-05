// Ensure your DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", () => {
  getPlants();
});

async function getPlants() {
  try {
    const response = await fetch("/api/plants");
    if (!response.ok) {
      throw new Error(`HTTP fejl! status: ${response.status}`);
    }
    const plants = await response.json();
    displayPlants(plants);
  } catch (error) {
    console.error("Kunne ikke hente plantedata:", error);
  }
}

function displayPlants(plants) {
  const tbody = document.querySelector("#plantTable tbody");
  plants.forEach((plant) => {
    const row = document.createElement("tr");
    // Creating cells for each column
    const nameCell = document.createElement("td");
    nameCell.textContent = plant.name;
    row.appendChild(nameCell);

    const humidityLowCell = document.createElement("td");
    humidityLowCell.textContent = `${plant.humidityLow} %`;
    row.appendChild(humidityLowCell);

    const humidityHighCell = document.createElement("td");
    humidityHighCell.textContent = `${plant.humidityHigh} %`;
    row.appendChild(humidityHighCell);

    const fertilizerCell = document.createElement("td");
    fertilizerCell.textContent = `${plant.fertilizer} μS`;
    row.appendChild(fertilizerCell);

    const editCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.textContent = "Rediger";
    editButton.onclick = () =>
      (window.location.href = `/edit_page/${plant.id}`);
    editCell.appendChild(editButton);
    row.appendChild(editCell);

    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Slet";

    deleteButton.onclick = () => deletePlant(plant.id);
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    tbody.appendChild(row);
  });
}

function deletePlant(id) {
  if (confirm("Er du sikker på du vil slette planten ?")) {
    fetch(`/api/plants/delete/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunne ikke slette plante...");
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
        alert("Kunne ikke slette plante...");
      });
  }
}
