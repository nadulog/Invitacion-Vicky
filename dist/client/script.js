const eventDate = new Date("2026-11-28T21:15:00-03:00");

const invitationAudio = document.getElementById("invitationAudio");
const audioToggle = document.getElementById("audioToggle");

audioToggle.addEventListener("click", async () => {
  if (!invitationAudio.getAttribute("src")) {
    return;
  }

  if (invitationAudio.paused) {
    await invitationAudio.play();
    audioToggle.setAttribute("aria-pressed", "true");
    audioToggle.setAttribute("aria-label", "Pausar música");
    audioToggle.title = "Pausar música";
  } else {
    invitationAudio.pause();
    audioToggle.setAttribute("aria-pressed", "false");
    audioToggle.setAttribute("aria-label", "Reproducir música");
    audioToggle.title = "Reproducir música";
  }
});

invitationAudio.addEventListener("pause", () => {
  audioToggle.setAttribute("aria-pressed", "false");
});

const countdown = {
  days: document.getElementById("countdownDays"),
  hours: document.getElementById("countdownHours"),
  minutes: document.getElementById("countdownMinutes"),
  seconds: document.getElementById("countdownSeconds"),
};

function formatTime(value, length = 2) {
  return String(value).padStart(length, "0");
}

function renderCountdownPart(element, value) {
  if (element.textContent === value) {
    return;
  }

  element.textContent = value;
  element.classList.remove("is-ticking");
  void element.offsetWidth;
  element.classList.add("is-ticking");
}

function updateCountdown() {
  const remaining = Math.max(0, eventDate.getTime() - Date.now());

  renderCountdownPart(countdown.days, formatTime(Math.floor(remaining / 86_400_000), 3));
  renderCountdownPart(countdown.hours, formatTime(Math.floor((remaining % 86_400_000) / 3_600_000)));
  renderCountdownPart(countdown.minutes, formatTime(Math.floor((remaining % 3_600_000) / 60_000)));
  renderCountdownPart(countdown.seconds, formatTime(Math.floor((remaining % 60_000) / 1_000)));
}

updateCountdown();
setInterval(updateCountdown, 1_000);

const calendarLink = document.getElementById("calendarLink");
const eventEndDate = new Date("2026-11-29T03:15:00-03:00");

function toGoogleDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

const calendarParams = new URLSearchParams({
  action: "TEMPLATE",
  text: "Vicky's Fest - Mis 15",
  dates: `${toGoogleDate(eventDate)}/${toGoogleDate(eventEndDate)}`,
  details: "Cumple de 15 de Vicky.",
  ctz: "America/Argentina/Buenos_Aires",
});

calendarLink.href = `https://calendar.google.com/calendar/render?${calendarParams}`;

const mapModal = document.getElementById("mapModal");
const openMapButton = document.getElementById("openMap");
const closeMapButton = document.getElementById("closeMap");

openMapButton.addEventListener("click", () => mapModal.showModal());
closeMapButton.addEventListener("click", () => mapModal.close());

mapModal.addEventListener("click", (event) => {
  if (event.target === mapModal) {
    mapModal.close();
  }
});

const musicSection = document.querySelector(".music");

const musicObserver = new IntersectionObserver(
  ([entry], observer) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.disconnect();
    }
  },
  { threshold: 0.35 },
);

musicObserver.observe(musicSection);

const giftModal = document.getElementById("giftModal");
const openGiftButton = document.getElementById("openGift");
const closeGiftButton = document.getElementById("closeGift");
const copyAliasButton = document.getElementById("copyAlias");
const giftAlias = document.getElementById("giftAlias").textContent;

openGiftButton.addEventListener("click", () => giftModal.showModal());
closeGiftButton.addEventListener("click", () => giftModal.close());

giftModal.addEventListener("click", (event) => {
  if (event.target === giftModal) {
    giftModal.close();
  }
});

copyAliasButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(giftAlias);
  copyAliasButton.textContent = "ALIAS COPIADO";
  setTimeout(() => {
    copyAliasButton.textContent = "COPIAR ALIAS";
  }, 2000);
});
