const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js-ready");

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.appendChild(progressBar);

const topbar = document.querySelector(".topbar");
const nav = document.querySelector(".nav-links");

if (topbar && nav) {
  const menuButton = document.createElement("button");
  menuButton.className = "menu-toggle";
  menuButton.type = "button";
  menuButton.setAttribute("aria-label", "Open navigation");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.innerHTML = "<span></span><span></span><span></span>";
  topbar.appendChild(menuButton);

  menuButton.addEventListener("click", () => {
    const open = topbar.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      topbar.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

const updateScrollState = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  topbar?.classList.toggle("is-scrolled", window.scrollY > 30);
};

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const normalizePath = path => path.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
const currentPath = normalizePath(window.location.pathname);

document.querySelectorAll(".nav-links a").forEach(link => {
  if (normalizePath(new URL(link.href).pathname) === currentPath) {
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll(".marquee-track").forEach(track => {
  if (track.dataset.ready) return;
  const originals = [...track.children];
  originals.forEach(image => {
    image.loading = "eager";
    image.decoding = "async";
  });
  originals.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.alt = "";
    track.appendChild(clone);
  });
  track.dataset.ready = "true";
});

const previewBtn = document.querySelector("#previewBtn");
const result = document.querySelector("#bookingResult");

previewBtn?.addEventListener("click", () => {
  const visitType = document.querySelector("#visitType")?.value || "";
  const doctor = document.querySelector("#doctor")?.value || "";
  const isArabic = document.documentElement.lang === "ar" || document.body.dir === "rtl";

  if (result) {
    result.textContent = isArabic
      ? `\u062a\u0645 \u062a\u062c\u0647\u064a\u0632 \u0637\u0644\u0628\u0643: ${visitType} \u0645\u0639 ${doctor}. \u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0641\u0631\u064a\u0642\u0646\u0627 \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0639\u062f.`
      : `Request ready: ${visitType} with ${doctor}. Our team will contact you to confirm the appointment.`;
    result.classList.add("active");
  }
});

const animatedElements = document.querySelectorAll(
  ".trust-strip div, .track-card, .doctor-card, .page-grid article, .diagnostics-flow div, .portal-dashboard div, .portal-ui div, .booking-panel, .contact-card, .portal-card, .journey a"
);

[...animatedElements]
  .filter(element => !element.closest(".image-marquee"))
  .forEach((element, index) => {
    element.dataset.animate = "";
    element.style.setProperty("--delay", `${Math.min(index % 7, 6) * 65}ms`);
  });

const revealTargets = document.querySelectorAll("section, [data-animate]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );

  revealTargets.forEach(element => observer.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add("is-visible"));
}

document.querySelectorAll("img").forEach(image => {
  const markLoaded = () => image.classList.add("is-loaded");
  if (image.complete) markLoaded();
  else image.addEventListener("load", markLoaded, { once: true });
});

if (!reducedMotion) {
  document.querySelectorAll(".hero, .page-hero").forEach(scene => {
    let frame = 0;
    scene.addEventListener("pointermove", event => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = scene.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        scene.style.setProperty("--hero-pointer-x", `${x * 10}px`);
        scene.style.setProperty("--hero-pointer-y", `${y * 8}px`);
        frame = 0;
      });
    });
  });

  document.querySelectorAll(".doctor-card, .page-grid article, .journey a").forEach(element => {
    element.dataset.tilt = "";
    let frame = 0;

    element.addEventListener("pointermove", event => {
      if (event.pointerType === "touch" || frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        element.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-6px)`;
        frame = 0;
      });
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  document.querySelectorAll(".button, .nav-cta").forEach(button => {
    button.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      const bounds = button.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.12 - 3}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}
