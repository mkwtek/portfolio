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

// Nav hamburger selections
const burger = document.querySelector("#burger-menu");
const ul = document.querySelector(".main-nav");

// --- Mobile dropdown: animate the panel's own height open and closed ---
// The panel's box genuinely grows from 0 to its natural height (and back), the
// same mechanism Bootstrap's collapse uses - that's what makes it read as a
// smooth drop instead of an on/off wipe. Only JS knows the natural height, so
// JS sets max-height in px; CSS transitions it. Once open, the px constraint is
// released so a device rotation / taller viewport can't clip the menu.
let navReleaseTimer;

function openNav() {
  ul.classList.add("show");
  burger.classList.add("active");
  ul.style.maxHeight = ul.scrollHeight + "px";
  clearTimeout(navReleaseTimer);
  navReleaseTimer = setTimeout(() => {
    if (ul.classList.contains("show")) {
      ul.style.maxHeight = "none";
      ul.style.overflowY = "auto"; // let a very tall menu scroll on short screens
    }
  }, 450); // just past the 0.4s max-height transition
}

function closeNav() {
  clearTimeout(navReleaseTimer);
  // A transition from `none`/`auto` won't animate - pin the real height first.
  ul.style.maxHeight = ul.scrollHeight + "px";
  ul.style.overflowY = "hidden";
  void ul.offsetHeight; // force reflow so the pinned height registers
  ul.classList.remove("show");
  burger.classList.remove("active");
  ul.style.maxHeight = "0px";
}

burger.addEventListener("click", () => {
  ul.classList.contains("show") ? closeNav() : openNav();
});

// Select nav links
const navLink = document.querySelectorAll(".nav-link");

// Close the dropdown when a link inside it is tapped
navLink.forEach((link) =>
  link.addEventListener("click", () => {
    if (ul.classList.contains("show")) closeNav();
  })
);

// --- Keep the open/close animation for real burger taps only ---
// It otherwise also fires on first paint and when the viewport crosses the
// 1150px breakpoint (Chrome DevTools' device toolbar, or resizing a desktop
// window past it). Suppress the transition (.nav-suppress-anim on <nav>, see
// styles.css) for the first frame, and briefly whenever that breakpoint is
// crossed - matchMedia, not a plain resize listener, since mobile browsers fire
// resize constantly as the URL bar shows/hides on scroll.
const navEl = document.querySelector("nav");
if (navEl) {
  const clearNavSuppress = () => navEl.classList.remove("nav-suppress-anim");
  navEl.classList.add("nav-suppress-anim");
  requestAnimationFrame(() => requestAnimationFrame(clearNavSuppress));
  setTimeout(clearNavSuppress, 200); // fallback if rAF is throttled (e.g. loaded in a background tab)

  let navMqTimer;
  window.matchMedia("(min-width: 1151px)").addEventListener("change", (e) => {
    if (e.matches) {
      // back to the desktop row: drop any inline collapse styles the mobile menu left
      ul.style.maxHeight = "";
      ul.style.overflowY = "";
      ul.classList.remove("show");
      burger.classList.remove("active");
    }
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
