// 0 = zondag … 6 = zaterdag. null = gesloten. (Google Maps, okt 2026)
const HOURS = {
  0: null, 1: ["09:00", "19:00"], 2: ["09:00", "19:00"], 3: ["09:00", "19:00"],
  4: ["09:00", "19:00"], 5: ["09:00", "19:00"], 6: ["09:00", "19:00"],
};
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// ===== Openingsuren + live status (Belgische tijd) =====
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open — tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Gesloten — vandaag open om ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = `Gesloten — ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} open om ${HOURS[d][0]}`;
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const s = document.querySelector("[data-status]");
  s.classList.toggle("is-open", isOpen);
  s.textContent = isOpen ? `Nu open tot ${today[1]} — Rijschoolstraat 22` : "Rijschoolstraat 22 — Leuven";
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io.observe(el);
});

// ===== Tellers =====
const cio = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now();
  const tick = t => {
    const k = Math.min(1, (t - t0) / 1200);
    el.textContent = (end * (1 - Math.pow(1 - k, 3))).toFixed(dec).replace(".", ",");
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  cio.unobserve(el);
}), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach(el => cio.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
