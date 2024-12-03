const socket = io(); //load socket.io-client and connect to the host that serves the page
let plantID;
let plantname;
//Socket set up on string "UARTDATA"
socket.on("plantLog", function (data) {
  displayLog(data);
});

async function displayLog(plantReading) {
  const name = document.getElementById("plantName");
  const humidity = document.getElementById("humidity");
  const waterLevel = document.getElementById("waterLevel");
  const fertilizerlevel = document.getElementById("fertilizerlevel");
  const conductivity = document.getElementById("conductivity");

  if (plantReading.waterlevel < 20) {
    alert("Påfyld vand");
  }

  if (plantReading.fertilization < 10) {
    alert("Påfyld gødning");
  }

  //if plant id changes
  if (plantID != plantReading.id) {
    try {
      plantname = await getPlantName(plantReading.id);
    } catch {
      (err) => console.error(err);
    }
  }

  plantID = plantReading.id;
  name.textContent = plantname;
  humidity.textContent = plantReading.humidity;
  waterLevel.textContent = plantReading.waterlevel;
  fertilizerlevel.textContent = plantReading.fertilization;
  conductivity.textContent = plantReading.conductivity;
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

async function getPlantName(id) {
  let name;
  fetch(`/api/plants/${id}`).then((respons) => {
    const plant = respons.data;
    name = plant.name;
  });
  return name;
}
