document
  .getElementById("plantForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    const name = document.getElementById("name").value;
    const humidityLow = document.getElementById("humidityLow").value;
    const humidityHigh = document.getElementById("humidityHigh").value;
    const fertilizer = document.getElementById("fertilizer").value;

    if (humidityHigh < humidityLow) {
      alert("Humidity lav skal være mindre end humidity høj");
      return;
    }

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
        fertilizer: fertilizer,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //alert("Plant added successfully!");
          window.location.href = "/admin_page";
          alert(`Planten (${name}) er tilføjet!`);
        } else {
          alert("Kunne ikke tilføje plante.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
