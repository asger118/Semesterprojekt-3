document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/plants")
    .then((response) => response.json())
    .then((data) => {
      let dropdown = document.getElementById("dropdown");
      data.forEach((name) => {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        dropdown.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
});

document.getElementById("dropdown").addEventListener("change", function () {
  var submitButton = document.getElementById("add_button");
  if (this.value) {
    submitButton.style.display = "block"; // Show the button when a valid option is selected
  } else {
    submitButton.style.display = "none"; // Hide the button if no valid option is selected
  }
});

// Ensure this code runs after the document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the button element
  const button = document.getElementById("startLogButton");
  // Get the dropwdown element
  const dropdown = document.getElementById("dropdown");

  // Add click event listener to the button
  button.addEventListener("click", function () {
    const dropdownValue = selectElement.value;
    alert(`Start regularing af ${value}`);
    window.location.href = "/log_page:";
  });
});
