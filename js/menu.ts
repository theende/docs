const menuToggle = document.querySelector("#toggle-menu");
const sidebar = document.querySelector("#sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
