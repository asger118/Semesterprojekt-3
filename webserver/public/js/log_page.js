const socket = io(); //load socket.io-client and connect to the host that serves the page
// Global variables for klient to know wich plant if being regulated
let plantID;
let plantname;
//Socket to recieve updates on sensor data
socket.on("plantLog", function (data) {
  // Call function to display new sensor data
  displayLog(data);
  // Update graphs
  updateLog();
});

// Function to update HTML dynamically
async function displayLog(plantReading) {
  // Get refrence to HTML elements
  const name = document.getElementById("plantHeading");
  const humidity = document.getElementById("humidity");
  const waterLevel = document.getElementById("waterLevel");
  const fertilizerlevel = document.getElementById("fertilizerlevel");
  const conductivity = document.getElementById("conductivity");

  // Check if water level too low
  if (plantReading.waterlevel < 20) {
    alert("Påfyld vand");
  }
  // Check if fertelizer too low
  if (plantReading.fertilization < 10) {
    alert("Påfyld gødning");
  }

  //if plant id changes set global variable
  if (plantID != plantReading.id) {
    try {
      plantname = await getPlantName(plantReading.id);
    } catch {
      (err) => console.error(err);
    }
  }
  // Set HTML elements to display latest data
  plantID = plantReading.id;
  name.innerText = plantname;
  humidity.textContent = plantReading.humidity;
  waterLevel.textContent = plantReading.waterlevel;
  fertilizerlevel.textContent = plantReading.fertilization;
  conductivity.textContent = plantReading.conductivity;
}
// Call endpoint to stop regulation
function stopLog() {
  fetch("/api/stopLog", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Succes message
      alert("Regulering er stoppet");
      window.location.href = "/";
    })
    .catch((error) => {
      // Error message
      console.error("There was an error!", error);
    });
}
// Function to get name of plant being regulated
async function getPlantName(id) {
  let name;
  // get plant by id
  fetch(`/api/plants/${id}`).then((respons) => {
    const plant = respons.data;
    name = plant.name;
  });
  return name;
}

let chart1;
let chart2;
let chart3;
let chart4;
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


 /*
Function: drawGraph(logs)
Description: Display logs grafikal on the webserver
Parameters: logs, logs found in databased, which is used to display 
Return value: None 
*/
function drawGraph(logs) {
  //Arrays for each data type, used on axis in graph
  let time = [];
  let humidity = [];
  let waterLevel = [];
  let fertilization = [];
  let conductivity = [];

  //Separates the values from logs, so that each type becomes an array
  for (let i = 0; i < logs.length; i++) {
    time[i] = logs[i].time;
    humidity[i] = logs[i].humidity;
    waterLevel[i] = logs[i].waterlevel;
    fertilization[i] = logs[i].fertilization;
    conductivity[i] = logs[i].conductivity;
  }

  //Checks if chart is already created
  if (!chart1) {
     //Creating chart for humidity
    chart1 = new Chart("humidityChart", {
      type: "line",
      data: {
        labels: time,  //Sets x-axis
        datasets: [
          {
            data: humidity,  //Sets y-axis
            borderColor: "red",  //Sets color to red
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {  //Sets title
            display: true,
            text: "Jordfugtighed",
            font: { size: 24 },
          },
        },
        scales: {
          x: {  //Sets x-axis title
            title: { 
              display: true,
              text: "Tidsstempler",
              font: {
                size: 14,
              },
            },
          },
          y: { //Sets y-axis title
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
  } else {
    //If chart is already created run addData, adding data to existing chart
    addData(chart1, time[logs.length - 1], humidity[logs.length - 1]);
  }

  //Checks if chart is already created
  if (!chart2) {
    //Creating waterLevel chart
    chart2 = new Chart("waterLevelChart", {
      type: "line",
      data: {
        labels: time, //Sets x-axis
        datasets: [
          {
            data: waterLevel,  //Sets y-axis
            borderColor: "blue",  //Sets color to blue
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {  //Sets title
            display: true,
            text: "Vandbeholdning",
            font: { size: 24 },
          },
        },
        scales: {
          x: {    //Sets x-axis title
            title: {
              display: true,
              text: "Tidsstempler",
              font: {
                size: 14,
              },
            },
          },
          y: {   //Sets y-axis title
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
  } else {
    //If chart is already created run addData, adding data to existing chart
    addData(chart2, time[logs.length - 1], waterLevel[logs.length - 1]);
  }

  //Checks if chart is already created
  if (!chart3) {
    //Creates fertilization chart
    chart3 = new Chart("fertilizationChart", {
      type: "line",
      data: {
        labels: time,  //Sets x-axis
        datasets: [
          {
            data: fertilization,  //Sets y-axis
            borderColor: "green",  //Sets the color to green
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {  //Sets title
            display: true,
            text: "Gødningsbeholdning",  
            font: { size: 24 },
          },
        },
        scales: {
          x: {    //Sets x-axis title
            title: {
              display: true,
              text: "Tidsstempler",
              font: {
                size: 14,
              },
            },
          },
          y: {    //Sets y-axis title
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
  } else {
     //If chart is already created run addData, adding data to existing chart
    addData(chart3, time[logs.length - 1], fertilization[logs.length - 1]);
  }

  //Checks if chart is already created
  if (!chart4) {
    //creates conductivity chart
    chart4 = new Chart("conductivityChart", {
      type: "line",
      data: {
        labels: time,  //sets x-axis
        datasets: [
          {
            data: conductivity,  //Sets y-axis title
            borderColor: "yellow",  //Sets color to yellow
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {  //Sets title
            display: true,
            text: "Ledningsevne",
            font: { size: 24 },
          },
        },
        scales: {
          x: {  //Set x-axis title
            title: {
              display: true,
              text: "Tidsstempler",
              font: {
                size: 14,
              },
            },
          },
          y: {  //Set y-axis title
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
  } else {
    //If chart is already created run addData, adding data to existing chart
    addData(chart4, time[logs.length - 1], conductivity[logs.length - 1]);
  }
}

function addData(chart, label, newData) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(newData);
  });
  chart.update();
}
