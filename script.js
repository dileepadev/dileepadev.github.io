function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("theme-icon");

  if (body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    icon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    icon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
}

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.body.className = savedTheme + "-mode";
document.getElementById("theme-icon").textContent =
  savedTheme === "dark" ? "☀️" : "🌙";
