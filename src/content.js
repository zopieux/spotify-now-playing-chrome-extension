function setup(attempts) {
  const DEBOUNCE_INTERVAL_MS = 200;

  let data = {};
  let writableHandle;
  let debounceTimer;

  async function observeChanges(element, callback) {
    const observer = new MutationObserver((mutationsList) => {
      const relevantMutations = mutationsList.filter(m => m.type === "childList" || m.type === "attributes");
      if (relevantMutations.length) {
        callback();
      }
    });
    observer.observe(element, { attributes: true, characterData: true, childList: true });
    return () => { observer.disconnect() };
  }

  function getCoverElement() {
    return document.querySelector('[data-testid=cover-art-image]');
  }

  function getSongElement() {
    return document.querySelector('[data-testid="context-item-link"]');
  }

  function getArtistElement() {
    return Array.from(document.querySelector('[data-testid="context-item-info-subtitles"]').querySelectorAll('a[data-testid="context-item-info-artist"]')).map(artistLink => artistLink.textContent.trim());
  }

  function getCover() {
    return getCoverElement().src;
  }

  function getSong() {
    return getSongElement().innerText;
  }

  async function saveNowPlaying() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const writable = await writableHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log("Spotify Now Playing: wrote file");
  }

  function updateNowPlaying() {
    const newData = {
      cover: getCover(),
      song: getSong(),
      artist: getArtist(),
    };
    // Merge non-empty entries only.
    const nonEmptyEntries = Object.entries(newData).filter(([key, value]) => typeof value === "string" && value.length > 0);
    if (!nonEmptyEntries.length) return;

    data = { ...data, ...Object.fromEntries(nonEmptyEntries) };
    if (debounceTimer) { clearTimeout(debounceTimer); }
    debounceTimer = setTimeout(async () => { await saveNowPlaying() }, DEBOUNCE_INTERVAL_MS);
  }

  const nowPlaying = document.querySelector('[data-testid="now-playing-widget"]');

  async function startObserving() {
    await observeChanges(nowPlaying, () => { updateNowPlaying() });
    console.log("Spotify Now Playing is now observing current song.");
    // Update once at start.
    updateNowPlaying();
  }

  // Add the button to the page.

  if (!nowPlaying) {
    if (attempts >= 3) {
      console.warn("Spotify Now Playing: current song element not found on page. Exiting after multiple attempts.");
    } else {
      setTimeout(() => setup(attempts + 1), 1000);
    }
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "content-button-wrapper";

  const startButton = document.createElement("div");
  startButton.title = "Choose Now Playing path";
  startButton.style.width = startButton.style.height = "16px";
  startButton.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjgiIGhlaWdodD0iMTY4Ij4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNNjguNSA0Mi41OThjLTEyLjYyNC4yNjktMjUuMzA4IDEuNzEzLTM3LjQzNiA1LjMzOC00LjA5NSAxLjE5Mi03LjA2OSA1LjMwOC02LjkyNiA5LjU2OS4wMTEgNC4xMDIgMi44ODcgNy45NzcgNi44MDggOS4xODEgMi4yNDkuNzY4IDQuNzA2LjUzNiA2LjkxNC0uMjU0IDYuMzAxLTEuODA2IDEyLjg3LTIuODc4IDE5LjMzLTMuNTIgMS4xMTItLjEwMSAyLjQ3Mi0uMjIzIDMuNjE2LS4zMDEgNS4wOC0uMzY5IDEwLjIzOC0uNDU4IDE1LjI3NC0uMzMgMy44MTYuMTA3IDcuNzk4LjM2IDExLjQ2MS43MjVhMTUxLjQgMTUxLjQgMCAwMTguNjkxIDEuMTI0YzMuNzA3LjU4NiA3LjQyMyAxLjMyNyAxMS4wMDIgMi4yMDkgOC45NDEgMi4yMDEgMTcuNzcyIDUuMzg4IDI1Ljc1OCAxMC4xNjkgMy40OTQgMS44NDkgOC4wNzcgMS4zMTMgMTEuMDItMS4zNDIgMy4xNDItMi42OCA0LjIzOC03LjQyIDIuNTg0LTExLjIwNS0uOTQyLTIuMzQzLTIuODgtNC4xNDUtNS4xMTItNS4yNTgtMTEuODc4LTYuNzktMjUuMTI1LTEwLjg4Mi0zOC41MzEtMTMuMzVDOTEuNiA0My4yOCA4MC4wMzUgNDIuNDAyIDY4LjUgNDIuNTk3eiIvPgogIDxwYXRoIGZpbGw9IiMxZWQ3NjAiIGQ9Ik04My45OTYuMjc3QzM3Ljc0Ny4yNzcuMjU0IDM3Ljc3MS4yNTQgODQuMDJjMCA0Ni4yNSAzNy40OTMgODMuNzQgODMuNzQyIDgzLjc0IDQ2LjI1NCAwIDgzLjc0NC0zNy40OSA4My43NDQtODMuNzRDMTY3Ljc0IDM3Ljc3NCAxMzAuMjUuMjggODMuOTk0LjI4ek03MS4yNTIgNDQuNTY4YzI0LjM2LS4wNjIgNTAuODUgNC45MzggNzAuMjcxIDE2LjQ2N2E3LjgyNSA3LjgyNSAwIDAxMi43NCAxMC43MzVjLTIuMiAzLjcyMi03LjAyIDQuOTQ4LTEwLjczIDIuNzM4aC0uMDA0Yy0yNi45OS0xNi4wMzEtNzEuNTItMTcuNTA1LTk3LjI4OS05LjY4NC00LjEzOCAxLjI1NS04LjUxMy0xLjA4LTkuNzY3LTUuMjE5YTcuODM2IDcuODM2IDAgMDE1LjIyLTkuNzcxYzExLjA5My0zLjM2OCAyNC45NDMtNS4yMjggMzkuNTU5LTUuMjY2eiIvPgogIDxnIGZpbGw9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41MTgiIGFyaWEtbGFiZWw9Ik5vdyIgZm9udC1mYW1pbHk9IlJvYm90byIgZm9udC1zaXplPSI2MC43MjMiIGZvbnQtd2VpZ2h0PSI5MDAiIGxldHRlci1zcGFjaW5nPSIwIiBzdHlsZT0ibGluZS1oZWlnaHQ6MS4yNSIgd29yZC1zcGFjaW5nPSIwIj4KICAgIDxwYXRoIGQ9Ik02MS42NTYgMTE2LjMwMkg1MS4zMDhMMzYuMDEgODkuNDM5djI2Ljg2M0gyNS42MDJ2LTQzLjE3aDEwLjQwN2wxNS4yNyAyNi44NjNWNzMuMTMyaDEwLjM3N3pNNjYuNTE5IDk5Ljk2NXEwLTQuODAzIDEuODY3LTguNTQgMS44NjgtMy43NjUgNS4zNjctNS43OCAzLjQ5OS0yLjAxNyA4LjIxMy0yLjAxNyA3LjIwNSAwIDExLjM1NiA0LjQ3NyA0LjE1IDQuNDQ4IDQuMTUgMTIuMTI3di4zNTZxMCA3LjUwMS00LjE4IDExLjkxOS00LjE1IDQuMzg4LTExLjI2NyA0LjM4OC02Ljg0OSAwLTExLTQuMDkyLTQuMTUtNC4xMjEtNC40NzctMTEuMTQ4em05Ljk5Mi42MjNxMCA0LjQ0NyAxLjM5MyA2LjUyMyAxLjM5NCAyLjA3NSA0LjEyMSAyLjA3NSA1LjMzNyAwIDUuNDU2LTguMjEzdi0xLjAwOHEwLTguNjI4LTUuNTE1LTguNjI4LTUuMDEgMC01LjQyNiA3LjQ0MnpNMTI5LjU4MyAxMDMuMTM3bDMuMjMyLTE4LjkxNmg5LjU3N2wtNy41NiAzMi4wODFoLTguNDVsLTUuMzA4LTE5LjAzNS01LjMzNyAxOS4wMzVoLTguNDVsLTcuNTYtMzIuMDgxaDkuNTc2bDMuMTczIDE5LjM2MSA1LjEtMTkuMzYxaDYuOTY3eiIgc3R5bGU9Ii1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J1JvYm90byBIZWF2eSciLz4KICA8L2c+Cjwvc3ZnPgo=")';
  startButton.style.backgroundSize = "contain";

  startButton.addEventListener("click", async (e) => {
    e.preventDefault();
    writableHandle = await window.showSaveFilePicker({
      types: [{ description: "JSON text file", accept: { "application/json": [".json"] } }]
    });
    startButton.parentNode.removeChild(startButton);
    wrapper.parentNode.removeChild(wrapper);
    await startObserving();
  });

  wrapper.appendChild(startButton);
  nowPlaying.appendChild(wrapper);
}

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    setTimeout(() => setup(0), 1000);
  }
});
