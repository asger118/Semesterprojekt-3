const socket = io(); //load socket.io-client and connect to the host that serves the page
let plantID;

//Socket set up on string "UARTDATA"
socket.on("plantLog", function (data) {
  const plantReading = JSON.parse(data);
  console.log(plantReading);
  updateFrontend(plantReading);
});

function updateFrontend(plantReading) {
  //const name = document.getElementById("plantName");
  const humidity = document.getElementById("humidity");
  const waterLevel = document.getElementById("waterLevel");
  const fertilizerlevel = document.getElementById("fertilizerlevel");
  const conductivity = document.getElementById("conductivity");

  humidity.textContent = humidity.textContent = plantReading[0];
  waterLevel.textContent = plantReading[1];
  fertilizerlevel.textContent = plantReading[2];
  conductivity.textContent = plantReading[3];
}

function stopLog() {
  fetch("/api/stopLog", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
}
