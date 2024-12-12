document
  .getElementById("plantForm")
  .addEventListener("submit", function (event) {
    //Adds eventListener on "submit"
    event.preventDefault(); // Prevent the default form submission
    const name = document.getElementById("name").value; // Gets "name" from HTML-element that the user inserts
    const humidityLow = document.getElementById("humidityLow").valueAsNumber; //Gets "humidityLow" from HTML-element that the user inserts
    const humidityHigh = document.getElementById("humidityHigh").valueAsNumber; //Gets "humidityHigh" from HTML-element that the user inserts
    const fertilizer = document.getElementById("fertilizer").valueAsNumber; //Gets "fertilizer" from HTML-element that the user inserts

    //Checks value of HumidityHigh is higher than humidityLow.
    if (humidityHigh < humidityLow) {
      alert("Humidity lav skal være mindre end humidity høj");
      return;
    }

    // Send the data to the server with HTTP-POST method on rest-api.
    fetch("/api/add_plant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Put plant details in request body
      body: JSON.stringify({
        name: name,
        humidityLow: humidityLow,
        humidityHigh: humidityHigh,
        fertilizer: fertilizer,
      }),
    })
      //Confirm/error
      .then((response) => response.json()) //Parses to js-object, and sends promise to next .then()
      .then((data) => {
        //data is the parsed information, and is the promise that either is fulfilled or rejected
        if (data.success) {
          //Fulfilled
          window.location.href = "/admin_page";
          alert(`Planten (${name}) er tilføjet!`);
        } else {
          //rejected
          alert("Kunne ikke tilføje plante.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
