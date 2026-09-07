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
const navWrap = document.querySelector(".main-nav-wrap");

// --- Mobile dropdown ---
// The open/close height animation is pure CSS (.main-nav-wrap is a 1-row grid
// going 0fr <-> 1fr, see styles.css). JS only toggles the .show class.
function setNav(open) {
  navWrap.classList.toggle("show", open);
  burger.classList.toggle("active", open);
}

burger.addEventListener("click", () =>
  setNav(!navWrap.classList.contains("show"))
);

// Select nav links
const navLink = document.querySelectorAll(".nav-link");

// Close the dropdown when a link inside it is tapped
navLink.forEach((link) =>
  link.addEventListener("click", () => setNav(false))
);

// --- Keep the open/close animation for real burger taps only ---
// It otherwise also fires on first paint and when the viewport crosses the
// 1150px breakpoint (Chrome DevTools' device toolbar, or resizing a desktop
// window past it) - both move the menu between its shown and hidden states, so
// you'd see it flash. Suppress the transition (.nav-suppress-anim on <nav>, see
// styles.css) for the first frame, and briefly whenever that breakpoint is
// crossed - matchMedia, not a plain resize listener, since mobile browsers fire
// resize constantly as the URL bar shows/hides on scroll.
const navEl = document.querySelector("nav");
if (navEl) {
  const clearNavSuppress = () => navEl.classList.remove("nav-suppress-anim");
  navEl.classList.add("nav-suppress-anim");
  requestAnimationFrame(() => requestAnimationFrame(clearNavSuppress));
  setTimeout(clearNavSuppress, 200); // fallback if rAF is throttled (e.g. background tab on load)

  let navMqTimer;
  window.matchMedia("(min-width: 1151px)").addEventListener("change", (e) => {
    if (e.matches) setNav(false); // leaving mobile: make sure the menu isn't left open
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
