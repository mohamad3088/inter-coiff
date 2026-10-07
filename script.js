// ===== Pas hier diensten, prijzen & uren aan =====
// price: "€20" of null (= geen prijs tonen)
const PRICES = [
  {
    "name": "Knippen heren",
    "desc": "Klassiek met de schaar of kort met de tondeuse.",
    "price": null
  },
  {
    "name": "Fades & tapers",
    "desc": "Skin, low, mid of high — strak uitgelopen.",
    "price": null
  },
  {
    "name": "Baard",
    "desc": "Trimmen, in model brengen en scherpe contouren.",
    "price": null
  },
  {
    "name": "Kinderen",
    "desc": "Rustig en geduldig geknipt.",
    "price": null
  },
  {
    "name": "Wassen & styling",
    "desc": "Even opfrissen met de juiste producten.",
    "price": null
  }
];

// 0 = zondag … 6 = zaterdag. [open, sluit] of null = gesloten.
const HOURS = {"0": null, "1": ["09:00", "19:00"], "2": ["09:00", "19:00"], "3": ["09:00", "19:00"], "4": ["09:00", "19:00"], "5": ["09:00", "19:00"], "6": ["09:00", "19:00"]};
const OPEN_LABEL = "Rijschoolstraat 22, Leuven";
const CLOSED_LABEL = "Rijschoolstraat 22 · Leuven";
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// ===== Diensten =====
document.getElementById("priceList").innerHTML = PRICES.map(p => p.price ? `
  <div class="menu__item">
    <h3>${p.name}</h3><span class="menu__dots"></span><span class="menu__price">${p.price}</span>
    <p>${p.desc}</p>
  </div>` : `
  <div class="menu__item menu__item--noprice">
    <h3>${p.name}</h3>
    <p>${p.desc}</p>
  </div>`).join("");

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
  if (isOpen) text = `Nu open · tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Gesloten · opent vandaag om ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = HOURS[d] ? `Gesloten · opent ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} om ${HOURS[d][0]}` : "Gesloten";
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const s = document.querySelector("[data-status]");
  s.classList.toggle("is-open", isOpen);
  s.textContent = isOpen ? `Nu open · ${OPEN_LABEL}` : CLOSED_LABEL;
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });

// ===== Lightbox =====
const items = [...document.querySelectorAll(".gallery__item img")];
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let idx = 0;
const show = i => { idx = (i + items.length) % items.length; lbImg.src = items[idx].src; lbImg.alt = items[idx].alt; };
items.forEach((img, i) => img.parentElement.addEventListener("click", () => { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; }));
const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
lb.querySelector(".lightbox__close").addEventListener("click", close);
lb.querySelector(".lightbox__prev").addEventListener("click", e => { e.stopPropagation(); show(idx - 1); });
lb.querySelector(".lightbox__next").addEventListener("click", e => { e.stopPropagation(); show(idx + 1); });
lb.addEventListener("click", e => { if (e.target === lb) close(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "ArrowRight") show(idx + 1);
});

document.getElementById("year").textContent = new Date().getFullYear();
