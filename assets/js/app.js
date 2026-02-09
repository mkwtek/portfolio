// Auto-update Copyright Year
const yearSpan = document.querySelector("#current-year");
if (yearSpan) {
  yearSpan.innerText = new Date().getFullYear();
}

// Scroll to top selection
const scrollUp = document.querySelector("#scroll-up");

// Scroll to top functionality
scrollUp.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

// Nav hamburgerburger selections
const burger = document.querySelector("#burger-menu");
const ul = document.querySelector(".main-nav"); // Changed to class for precision if adding additional menus later instead of more general "nav ul" and "nav" below.
// const ul = document.querySelector("nav ul");
// const nav = document.querySelector("nav");

// Hamburger menu function
burger.addEventListener("click", () => {
    ul.classList.toggle("show");
  });

// Select nav links
const navLink = document.querySelectorAll(".nav-link");

// Close hamburger menu when a link is clicked
navLink.forEach((link) =>
  link.addEventListener("click", () => {
    ul.classList.remove("show");
  })
);

