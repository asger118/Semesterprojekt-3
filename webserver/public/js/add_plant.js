document
  .getElementById("plantForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    const name = document.getElementById("name").value;
    const humidityLow = document.getElementById("humidityLow").value;
    const humidityHigh = document.getElementById("humidityHigh").value;

    // Send the data to the server
    fetch("/api/add_plant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        humidityLow: humidityLow,
        humidityHigh: humidityHigh,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //alert("Plant added successfully!");
          window.location.href = "/";
          alert(`Plant (${name}) added successfully!`);
        } else {
          alert("Failed to add plant.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
