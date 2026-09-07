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
    burger.classList.toggle("active"); // toggles the bars <-> X animation
  });

// Select nav links
const navLink = document.querySelectorAll(".nav-link");

// Close hamburger menu when a link is clicked
navLink.forEach((link) =>
  link.addEventListener("click", () => {
    ul.classList.remove("show");
    burger.classList.remove("active"); // reset bars back to hamburger state
  })
);

// --- Mobile nav: keep the open/close animation for real burger taps only ---
// The dropdown's transition otherwise also fires on first paint and when the
// viewport crosses the 1150px breakpoint (toggling Chrome DevTools' device
// toolbar, or resizing a desktop window past it) - both move the menu between
// its shown and hidden states, so you'd see it flash. Fix: suppress the
// transition (.nav-suppress-anim on <nav>, see styles.css) for the first frame,
// and briefly whenever that one breakpoint is actually crossed. matchMedia,
// NOT a plain resize listener - mobile browsers fire resize constantly as the
// URL bar shows/hides on scroll, and that was swallowing the open animation
// almost every time.
const navEl = document.querySelector("nav");
if (navEl) {
  const clearNavSuppress = () => navEl.classList.remove("nav-suppress-anim");
  navEl.classList.add("nav-suppress-anim");
  requestAnimationFrame(() => requestAnimationFrame(clearNavSuppress));
  setTimeout(clearNavSuppress, 200); // fallback if rAF is throttled (e.g. loaded in a background tab)

  let navMqTimer;
  window.matchMedia("(min-width: 1151px)").addEventListener("change", () => {
    navEl.classList.add("nav-suppress-anim");
    clearTimeout(navMqTimer);
    navMqTimer = setTimeout(clearNavSuppress, 250);
  });
}

// Contact form: submit via fetch so the visitor never leaves the site or sees Formspree's page
const contactForm = document.querySelector("#contact-form");
const formSuccess = document.querySelector("#form-success");
const formError = document.querySelector("#form-error");
const recaptchaError = document.querySelector("#recaptcha-error");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    formError.hidden = true;
    recaptchaError.hidden = true;

    // reCAPTCHA populates this hidden field only once the checkbox is checked
    const recaptchaResponse = contactForm.querySelector("#g-recaptcha-response");
    if (!recaptchaResponse || !recaptchaResponse.value) {
      recaptchaError.hidden = false;
      return;
    }

    const submitBtn = contactForm.querySelector("#submit-btn");
    submitBtn.disabled = true;
    submitBtn.value = "Sending...";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        contactForm.hidden = true;
        formSuccess.hidden = false;
        contactForm.reset();
      } else {
        formError.hidden = false;
      }
    } catch (err) {
      formError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.value = "Submit";
      // reCAPTCHA tokens are single-use, reset the widget so a retry works
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    }
  });
}
