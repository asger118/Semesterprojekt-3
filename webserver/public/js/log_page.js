const socket = io(); //load socket.io-client and connect to the host that serves the page
let plantID;
let plantname;
//Socket set up on string "UARTDATA"
socket.on("plantLog", function (data) {
  displayLog(data);
  updateLog();
});

async function displayLog(plantReading) {
  const name = document.getElementById("plantHeading");
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
  name.innerText = plantname;
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
      alert("Regulering er stoppet");
      window.location.href = "/";
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

function updateLog() {
  //https://www.w3schools.com/graphics/plot_chartjs.asp
  fetch("/api/updateLog", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      drawGraph(data);
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
}

let chart1;

function drawGraph(logs) {
  let time = [];
  let humidity = [];
  let waterLevel = [];
  let fertilization = [];
  let conductivity = [];

  for (let i = 0; i < logs.length; i++) {
    time[i] = logs[i].time;
    humidity[i] = logs[i].humidity;
    waterLevel[i] = logs[i].waterlevel;
    fertilization[i] = logs[i].fertilization;
    conductivity[i] = logs[i].conductivity;
  }
  if (chart1) {
    chart1.destroy();
    chart2.destroy();
    chart3.destroy();
    chart4.destroy();
  }
  const chart1 = new Chart("humidityChart", {
    type: "line",
    data: {
      labels: time,
      datasets: [
        {
          data: humidity,
          borderColor: "red",
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Jordfugtighed",
          font: { size: 24 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Tidsstempler",
            font: {
              size: 14,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Jordfugtighed i %",
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });

  const chart2 = new Chart("waterLevelChart", {
    type: "line",
    data: {
      labels: time,
      datasets: [
        {
          data: waterLevel,
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Vandbeholdning",
          font: { size: 24 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Tidsstempler",
            font: {
              size: 14,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Vandniveau i %",
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });

  const chart3 = new Chart("fertilizationChart", {
    type: "line",
    data: {
      labels: time,
      datasets: [
        {
          data: fertilization,
          borderColor: "green",
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Gødningsbeholdning",
          font: { size: 24 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Tidsstempler",
            font: {
              size: 14,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Gødnings niveau i %",
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });

  const chart4 = new Chart("conductivityChart", {
    type: "line",
    data: {
      labels: time,
      datasets: [
        {
          data: conductivity,
          borderColor: "yellow",
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Ledningsevne",
          font: { size: 24 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Tidsstempler",
            font: {
              size: 14,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "MicroSiemens/cm",
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}

function updateGraphData(chart, newLabels, newData) {
  chart.data.labels = newLabels; // Opdater labels
  chart.data.datasets[0].data = newData; // Opdater data
  chart.update(); // Opdater grafen
}
