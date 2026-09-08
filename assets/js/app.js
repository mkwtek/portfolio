// Auto-update Copyright Year
const yearSpan = document.querySelector("#current-year");
if (yearSpan) {
  yearSpan.innerText = new Date().getFullYear();
}

// --- Scroll reveal ---
// Elements marked .reveal in the markup fade + rise in as they enter the
// viewport. The hidden start state is CSS (.js-reveal .reveal, set by the inline
// script in index.html). Here we just flip .is-visible once each one is in view,
// then stop observing it. Reduced-motion or no IntersectionObserver: reveal all
// immediately.
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // Fallback for the rare case where IntersectionObserver exists but never
    // delivers: a throttled scroll check that reveals anything already well into
    // view. Only touches on-screen elements, so the animation still plays for
    // everything the user scrolls to.
    let ticking = false;
    const scrollFallback = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        document
          .querySelectorAll(".reveal:not(.is-visible)")
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
              el.classList.add("is-visible");
            }
          });
      });
    };
    window.addEventListener("scroll", scrollFallback, { passive: true });
  }
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
const navEl = document.querySelector("nav");

// The dropdown hangs off the bottom edge of the sticky nav. The nav's height
// isn't fixed - the title font-size scales with viewport width - so measure it
// rather than hardcoding a top offset. Even a few px off makes the panel's top
// edge (and its accent line) visibly jump the moment the menu opens.
function positionNavWrap() {
  if (navEl && navWrap) {
    navWrap.style.top = navEl.getBoundingClientRect().bottom + "px";
  }
}
positionNavWrap();

// --- Mobile dropdown ---
// The open/close height animation is pure CSS (.main-nav-wrap is a 1-row grid
// going 0fr <-> 1fr, see styles.css). JS only toggles the .show class.
function setNav(open) {
  if (open) positionNavWrap(); // make sure the panel sits flush under the nav
  navWrap.classList.toggle("show", open);
  burger.classList.toggle("active", open);
  burger.setAttribute("aria-expanded", String(open));
}

burger.addEventListener("click", () =>
  setNav(!navWrap.classList.contains("show"))
);

// Escape closes the mobile menu and returns focus to the burger
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navWrap.classList.contains("show")) {
    setNav(false);
    burger.focus();
  }
});

// Select nav links
const navLink = document.querySelectorAll(".nav-link");

// After an on-page jump, move keyboard + screen-reader focus to the section's
// heading (each section <h2> is tabindex="0"), so the next Tab continues from
// there rather than the nav and a screen reader announces the section landed on.
// preventScroll so focus() doesn't fight the scroll that just ran.
function focusTarget(section) {
  const heading = section.querySelector("h2");
  (heading || section).focus({ preventScroll: true });
}

// Nav-link clicks: close the mobile menu, and for the on-page section links take
// over the scroll so no "#section" is left in the address bar (that hash is what
// makes a later refresh jump back to that section). CSS scroll-margin-top still
// applies to scrollIntoView, so the landing position is unchanged.
navLink.forEach((link) => {
  link.addEventListener("click", (e) => {
    setNav(false);
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return; // external link (Resume) - leave it alone
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    focusTarget(target);
  });
});

// Logo: scroll to the top without leaving a bare "#" in the URL
const navLogo = document.querySelector(".nav-title a");
if (navLogo) {
  navLogo.addEventListener("click", (e) => {
    e.preventDefault();
    setNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Genuine deep link (opened with #section): the inline script in <body> stripped
// the hash before the browser could jump to it; scroll there once here, after
// `load` (+ a short beat so lazy images above the target have taken their space).
// behavior:"instant" so it doesn't slow-scroll down the page under the CSS
// scroll-behavior:smooth. A plain refresh had no meaningful hash - stays at top.
if (window.__initialHash) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const target = document.getElementById(window.__initialHash);
      if (target) {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        focusTarget(target);
      }
    }, 50);
  });
}

// Keep the panel aligned if the nav height changes (viewport width crossing a
// font-size threshold, or the name wrapping to two lines under 350px). rAF-
// coalesced so URL-bar resize spam on mobile doesn't thrash layout.
let navPosRaf;
window.addEventListener("resize", () => {
  cancelAnimationFrame(navPosRaf);
  navPosRaf = requestAnimationFrame(positionNavWrap);
});

// --- Keep the open/close animation for real burger taps only ---
// It otherwise also fires on first paint and when the viewport crosses the
// 1150px breakpoint (Chrome DevTools' device toolbar, or resizing a desktop
// window past it) - both move the menu between its shown and hidden states, so
// you'd see it flash. Suppress the transition (.nav-suppress-anim on <nav>, see
// styles.css) for the first frame, and briefly whenever that breakpoint is
// crossed - matchMedia, not a plain resize listener, since mobile browsers fire
// resize constantly as the URL bar shows/hides on scroll.
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
      recaptchaError.hidden = false; // role="alert" announces it to screen readers
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
        formSuccess.focus(); // move SR + keyboard focus to the confirmation (the form it was in is now hidden)
        contactForm.reset();
      } else {
        formError.hidden = false;
        formError.focus();
      }
    } catch (err) {
      formError.hidden = false;
      formError.focus();
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
