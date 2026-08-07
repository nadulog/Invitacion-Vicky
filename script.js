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

const dateSection = document.querySelector(".event-date");
const dateReveal = document.getElementById("dateReveal");
const dateRevealCanvas = document.getElementById("dateRevealCanvas");
const dateRevealButton = document.getElementById("dateRevealButton");
const dateMagic = document.getElementById("dateMagic");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dateRevealStorageKey = "vicky-date-revealed";
let dateWasRevealed = false;

try {
  dateWasRevealed = sessionStorage.getItem(dateRevealStorageKey) === "true";
} catch {
  dateWasRevealed = false;
}

if (dateWasRevealed) {
  dateReveal.hidden = true;
  dateSection.classList.add("is-revealed-instant");
} else {
  const context = dateRevealCanvas.getContext("2d", { alpha: true });
  let activePointer = null;
  let previousPoint = null;
  let horizontalTravel = 0;
  let revealProgress = 0;

  function sizeDateRevealCanvas() {
    if (horizontalTravel > 0) {
      return;
    }

    const bounds = dateReveal.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    dateRevealCanvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    dateRevealCanvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, bounds.width, bounds.height);
    dateReveal.classList.add("is-initialized");
  }

  function eraseBetween(from, to) {
    const bounds = dateReveal.getBoundingClientRect();
    const brush = Math.min(46, Math.max(24, bounds.width * 0.075));
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = brush * 2;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }

  function completeDateReveal() {
    if (dateReveal.classList.contains("is-finishing")) {
      return;
    }

    dateReveal.classList.add("is-finishing");
    dateSection.classList.add("is-revealed");

    if (!reducedMotion) {
      dateMagic.classList.add("is-active");
    }

    try {
      sessionStorage.setItem(dateRevealStorageKey, "true");
    } catch {
      // La interacción sigue funcionando aunque el almacenamiento esté bloqueado.
    }

    window.setTimeout(() => {
      dateReveal.hidden = true;
    }, reducedMotion ? 280 : 430);
  }

  sizeDateRevealCanvas();

  const dateResizeObserver = new ResizeObserver(sizeDateRevealCanvas);
  dateResizeObserver.observe(dateReveal);

  dateReveal.addEventListener("pointerdown", (event) => {
    if (event.target === dateRevealButton) {
      return;
    }

    activePointer = event.pointerId;
    previousPoint = { x: event.offsetX, y: event.offsetY };
    dateReveal.setPointerCapture(event.pointerId);
  });

  dateReveal.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointer || !previousPoint) {
      return;
    }

    const nextPoint = { x: event.offsetX, y: event.offsetY };
    const deltaX = nextPoint.x - previousPoint.x;
    const deltaY = nextPoint.y - previousPoint.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      eraseBetween(previousPoint, nextPoint);
      horizontalTravel += Math.abs(deltaX);
      revealProgress = horizontalTravel / (dateReveal.clientWidth * 4.6);
      dateReveal.classList.toggle("is-scratching", revealProgress > 0.05);

      if (revealProgress >= 1) {
        completeDateReveal();
      }
    }

    previousPoint = nextPoint;
  });

  function releaseDatePointer(event) {
    if (event.pointerId === activePointer) {
      activePointer = null;
      previousPoint = null;
    }
  }

  dateReveal.addEventListener("pointerup", releaseDatePointer);
  dateReveal.addEventListener("pointercancel", releaseDatePointer);
  dateRevealButton.addEventListener("click", completeDateReveal);
}

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
