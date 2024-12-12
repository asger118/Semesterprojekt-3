// When page loads extract plant id from URL and call loadPlantData
document.addEventListener("DOMContentLoaded", () => {
  const pathParts = window.location.pathname.split("/");
  const plantId = pathParts[pathParts.length - 1];
  if (plantId) {
    // function call to populate form with plant details
    loadPlantData(plantId);
  }
});
// Function to populate form with plant details
async function loadPlantData(id) {
  try {
    // Get plant from rest-api
    const response = await fetch(`/api/plants/${id}`);
    // Chech if fetch was succesful
    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status}`);
    }
    // wait for fetch to succed
    const plant = await response.json();
    // Populate form with plant detials
    document.getElementById("plantForm").setAttribute("data-id", id);
    document.getElementById("name").value = plant.name;
    document.getElementById("humidityHigh").valueAsNumber = plant.humidityHigh;
    document.getElementById("humidityLow").valueAsNumber = plant.humidityLow;
    document.getElementById("fertilizer").valueAsNumber = plant.fertilizer;
  } catch (error) {
    console.error("Could not load plant data:", error);
  }
}
// Function to handle submission of edited plant
document
  .getElementById("plantForm")
  .addEventListener("submit", async function (event) {
    // Make sure page dont refresh so we can control the behavior
    event.preventDefault();

    // Get all the new values from html form elements
    const id = this.getAttribute("data-id");
    const name = document.getElementById("name").value;
    const humidityLow = document.getElementById("humidityLow").valueAsNumber;
    const humidityHigh = document.getElementById("humidityHigh").valueAsNumber;
    const fertilizer = document.getElementById("fertilizer").valueAsNumber;

    // make sure humidityHigh is greater than humidityLow
    if (humidityHigh < humidityLow) {
      alert("Humidity lav skal være mindre end humidity høj");
      return;
    }
    // Create edited plant object
    const plantData = {
      name: name,
      humidityLow: humidityLow,
      humidityHigh: humidityHigh,
      fertilizer: fertilizer,
    };
    console.log("Plant ID:", id);
    try {
      // fetch rest-api to edit plant
      const response = await fetch(`/api/plants/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // Send edited plant in request body
        body: JSON.stringify(plantData),
      });
      // Check if error acour
      if (!response.ok) {
        throw new Error("Could not update plant.");
      }
      // Wait for respons
      const data = await response.json();

      // Create succes message
      if (data.success) {
        alert(`Planten (${name}) er opdateret!`);
        window.location.href = "/admin_page";
      } else {
        // Create failure message
        alert("Could not update plant.");
      }
    } catch (error) {
      // Create failure message
      console.error("Error:", error);
      alert("Could not update plant.");
    }
  });
