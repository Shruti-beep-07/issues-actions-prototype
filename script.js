const menu = document.getElementById("mobileMenu");
const navLinks = document.getElementById("navLinks");
const demoModal = document.getElementById("demoModal");
const watchDemo = document.getElementById("watchDemo");

menu?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

watchDemo?.addEventListener("click", () => {
  demoModal.classList.add("open");
  demoModal.setAttribute("aria-hidden", "false");
});

document.querySelectorAll("[data-close]").forEach(el => {
  el.addEventListener("click", () => {
    demoModal.classList.remove("open");
    demoModal.setAttribute("aria-hidden", "true");
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    demoModal.classList.remove("open");
    demoModal.setAttribute("aria-hidden", "true");
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    document.querySelector(".search-pill")?.focus();
  }
});

// Keep the FAQ + button experience lightweight for a prototype.
// Replace placeholder links with real routes when backend/product pages exist.
