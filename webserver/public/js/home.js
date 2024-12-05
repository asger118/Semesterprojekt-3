let plants_ = [];

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/plants")
    .then((response) => response.json())
    .then((plants) => {
      plants_ = plants;
      const dropdown = document.getElementById("dropdown");
      plants.forEach((plant) => {
        let option = document.createElement("option");
        option.value = plant.id; // Use plant ID as the value
        option.textContent = plant.name;
        dropdown.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
});

document.getElementById("dropdown").addEventListener("change", function () {
  const submitButton = document.getElementById("startLogButton");
  if (this.value) {
    submitButton.style.display = "block"; // Show the button when a valid option is selected
  } else {
    submitButton.style.display = "none"; // Hide the button if no valid option is selected
  }
});

function startLog(plantID) {
  fetch("/api/startLog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plantID }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
}

// Ensure this code runs after the document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the button element
  const button = document.getElementById("startLogButton");
  // Get the dropdown element
  const dropdown = document.getElementById("dropdown");

  // Add click event listener to the button
  button.addEventListener("click", function () {
    console.log("start log");
    const dropdownValue = dropdown.value;
    const dropdownText = dropdown.options[dropdown.selectedIndex].text;
    alert(`Reguleringen af ${dropdownText} er startet`);
    startLog(dropdownValue); // Use the selected value directly as the plantID
    window.location.href = "/log_page";
  });
});
