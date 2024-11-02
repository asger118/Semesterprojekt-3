document
  .getElementById("plantForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    const plantName = document.getElementById("plant_name").value;
    const soilHumidity = document.getElementById("soil_humidity").value;

    // Send the data to the server
    fetch("/api/add_plant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plant_name: plantName,
        soil_humidity: soilHumidity,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //alert("Plant added successfully!");
          window.location.href = "/";
        } else {
          alert("Failed to add plant.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
