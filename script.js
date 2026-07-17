const STORAGE_KEY = "redirect-loop-guide-progress-v1";

const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-navigation");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNavigation?.classList.toggle("is-open", !isOpen);
});

siteNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    siteNavigation.classList.remove("is-open");
  });
});

const controlFilter = document.querySelector("#control-filter");
const controlPanels = [...document.querySelectorAll("[data-control-group]")];

function filterControls(value) {
  controlPanels.forEach((panel) => {
    panel.hidden = value !== "all" && panel.dataset.controlGroup !== value;
  });
}

controlFilter?.addEventListener("change", (event) => {
  filterControls(event.currentTarget.value);
});

const walkthroughSteps = [...document.querySelectorAll(".walkthrough-step")];
const progressElement = document.querySelector("#guide-progress");
const progressLabel = document.querySelector("#progress-label");
const continueButton = document.querySelector("#continue-guide");
const resetButton = document.querySelector("#reset-progress");

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(stored) ? stored.map(String) : []);
  } catch {
    return new Set();
  }
}

const completedSteps = loadProgress();

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedSteps]));
  } catch {
    // The guide remains fully usable when storage is unavailable.
  }
}

function renderProgress() {
  walkthroughSteps.forEach((step) => {
    const stepId = String(step.dataset.step);
    const complete = completedSteps.has(stepId);
    const button = step.querySelector("[data-complete-step]");
    const state = step.querySelector(".step-state");

    step.dataset.complete = String(complete);
    if (button) {
      button.setAttribute("aria-pressed", String(complete));
      button.textContent = complete ? "Completed — undo" : "Mark step complete";
    }
    if (state) {
      state.textContent = complete ? "Complete" : "Not done";
    }
  });

  const count = completedSteps.size;
  if (progressElement) {
    progressElement.value = count;
    progressElement.textContent = `${count} of ${walkthroughSteps.length}`;
  }
  if (progressLabel) {
    progressLabel.textContent = `${count} of ${walkthroughSteps.length} steps complete`;
  }
  if (continueButton) {
    continueButton.textContent = count === walkthroughSteps.length ? "Review completed guide" : "Continue guide";
  }
}

document.querySelectorAll("[data-complete-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const stepId = String(button.dataset.completeStep);
    if (completedSteps.has(stepId)) {
      completedSteps.delete(stepId);
    } else {
      completedSteps.add(stepId);
    }
    saveProgress();
    renderProgress();
  });
});

continueButton?.addEventListener("click", () => {
  const nextStep = walkthroughSteps.find((step) => !completedSteps.has(String(step.dataset.step))) ?? walkthroughSteps[0];
  nextStep.open = true;
  nextStep.scrollIntoView({ behavior: "smooth", block: "start" });
  nextStep.querySelector("summary")?.focus();
});

resetButton?.addEventListener("click", () => {
  completedSteps.clear();
  saveProgress();
  renderProgress();
});

renderProgress();

const problemDetails = [...document.querySelectorAll("#problem-list details")];

document.querySelector("#expand-problems")?.addEventListener("click", () => {
  problemDetails.forEach((detail) => {
    detail.open = true;
  });
});

document.querySelector("#collapse-problems")?.addEventListener("click", () => {
  problemDetails.forEach((detail) => {
    detail.open = false;
  });
});

const beginSpoilerReveal = document.querySelector("#begin-spoiler-reveal");
const spoilerConfirmation = document.querySelector("#spoiler-confirmation");
const spoilerContent = document.querySelector("#spoiler-content");

beginSpoilerReveal?.addEventListener("click", () => {
  const willOpen = spoilerConfirmation.hidden;
  spoilerConfirmation.hidden = !willOpen;
  beginSpoilerReveal.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    document.querySelector("#confirm-spoilers")?.focus();
  }
});

document.querySelector("#cancel-spoilers")?.addEventListener("click", () => {
  spoilerConfirmation.hidden = true;
  beginSpoilerReveal?.setAttribute("aria-expanded", "false");
  beginSpoilerReveal?.focus();
});

document.querySelector("#confirm-spoilers")?.addEventListener("click", () => {
  spoilerConfirmation.hidden = true;
  spoilerContent.hidden = false;
  beginSpoilerReveal?.setAttribute("aria-expanded", "true");
  spoilerContent.scrollIntoView({ behavior: "smooth", block: "start" });
  spoilerContent.querySelector("h3")?.setAttribute("tabindex", "-1");
  spoilerContent.querySelector("h3")?.focus();
});

document.querySelector("#hide-spoilers")?.addEventListener("click", () => {
  spoilerContent.hidden = true;
  spoilerConfirmation.hidden = true;
  beginSpoilerReveal?.setAttribute("aria-expanded", "false");
  beginSpoilerReveal?.scrollIntoView({ behavior: "smooth", block: "center" });
  beginSpoilerReveal?.focus();
});

const screenshotDialog = document.querySelector("#screenshot-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogCaption = document.querySelector("#dialog-caption");
const dialogCounter = document.querySelector("#dialog-counter");
const allScreenshotButtons = [...document.querySelectorAll(".screenshot-button")];
let currentScreenshotButton = null;

function visibleScreenshotButtons() {
  return allScreenshotButtons.filter((button) => !button.closest("[hidden]"));
}

function showScreenshot(button) {
  const sourceImage = button.querySelector("img");
  if (!sourceImage || !dialogImage || !dialogCaption || !dialogCounter) return;

  const visibleButtons = visibleScreenshotButtons();
  const index = visibleButtons.indexOf(button);
  currentScreenshotButton = button;
  dialogImage.src = sourceImage.src;
  dialogImage.alt = sourceImage.alt;
  dialogCaption.textContent = button.dataset.caption ?? sourceImage.alt;
  dialogCounter.textContent = `${index + 1} / ${visibleButtons.length}`;
}

allScreenshotButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreenshot(button);
    if (typeof screenshotDialog?.showModal === "function") {
      screenshotDialog.showModal();
    } else {
      screenshotDialog?.setAttribute("open", "");
    }
  });
});

document.querySelector("#close-dialog")?.addEventListener("click", () => {
  screenshotDialog?.close();
});

function moveScreenshot(direction) {
  const visibleButtons = visibleScreenshotButtons();
  const currentIndex = visibleButtons.indexOf(currentScreenshotButton);
  if (currentIndex < 0 || visibleButtons.length === 0) return;
  const nextIndex = (currentIndex + direction + visibleButtons.length) % visibleButtons.length;
  showScreenshot(visibleButtons[nextIndex]);
}

document.querySelector("#previous-image")?.addEventListener("click", () => moveScreenshot(-1));
document.querySelector("#next-image")?.addEventListener("click", () => moveScreenshot(1));

screenshotDialog?.addEventListener("click", (event) => {
  if (event.target === screenshotDialog) screenshotDialog.close();
});

screenshotDialog?.addEventListener("close", () => {
  currentScreenshotButton?.focus();
});

const observedSections = [...document.querySelectorAll("main > section[id]")];
const navigationLinks = [...document.querySelectorAll(".site-navigation a[href^='#']")];

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      navigationLinks.forEach((link) => {
        const selected = link.getAttribute("href") === `#${active.target.id}`;
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.2, 0.5] },
  );
  observedSections.forEach((section) => sectionObserver.observe(section));
}
