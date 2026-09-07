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

// --- Mobile nav: only play the drop-in/out transition for a real burger tap ---
// It otherwise also fires on first paint and whenever the viewport crosses the
// 1150px breakpoint (toggling Chrome DevTools' device toolbar, or dragging a
// desktop window narrower), because both move the menu between its shown and
// hidden states - so you see it flash open then slide away. Fix: keep the
// transition off (.nav-suppress-anim on <nav>, see styles.css), switch it on
// only after the first frame has painted, then off again for a beat around any
// resize.
const navEl = document.querySelector("nav");
if (navEl) {
  navEl.classList.add("nav-suppress-anim");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => navEl.classList.remove("nav-suppress-anim"))
  );
  let navResizeTimer;
  window.addEventListener("resize", () => {
    navEl.classList.add("nav-suppress-anim");
    clearTimeout(navResizeTimer);
    navResizeTimer = setTimeout(
      () => navEl.classList.remove("nav-suppress-anim"),
      300
    );
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
