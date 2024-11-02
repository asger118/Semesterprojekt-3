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
