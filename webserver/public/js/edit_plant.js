document.addEventListener("DOMContentLoaded", () => {
  const pathParts = window.location.pathname.split("/");
  const plantId = pathParts[pathParts.length - 1];
  if (plantId) {
    loadPlantData(plantId);
  }
});

async function loadPlantData(id) {
  try {
    const response = await fetch(`/api/plants/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status}`);
    }
    const plant = await response.json();
    document.getElementById("plantForm").setAttribute("data-id", id);
    document.getElementById("name").value = plant.name;
    document.getElementById("humidityHigh").value = plant.humidityHigh;
    document.getElementById("humidityLow").value = plant.humidityLow;
    document.getElementById("fertilizer").value = plant.fertilizer;
  } catch (error) {
    console.error("Could not load plant data:", error);
  }
}

document
  .getElementById("plantForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = this.getAttribute("data-id");
    const name = document.getElementById("name").value;
    const humidityLow = document.getElementById("humidityLow").value;
    const humidityHigh = document.getElementById("humidityHigh").value;
    const fertilizer = document.getElementById("fertilizer").value;

    if (humidityHigh < humidityLow) {
      alert("Humidity lav skal være mindre end humidity høj");
      return;
    }

    const plantData = {
      name: name,
      humidityLow: humidityLow,
      humidityHigh: humidityHigh,
      fertilizer: fertilizer,
    };
    console.log("Plant ID:", id);
    try {
      const response = await fetch(`/api/plants/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plantData),
      });

      if (!response.ok) {
        throw new Error("Could not update plant.");
      }

      const data = await response.json();
      if (data.success) {
        alert(`Planten (${name}) er opdateret!`);
        window.location.href = "/admin_page";
      } else {
        alert("Could not update plant.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not update plant.");
    }
  });
