/**
 * This script adds a video speed selector to the video player embedded in an iframe.
 * It allows users to change the playback speed of the video.
 *
 * Credits: @Carminepo2 (github)
 */

const IFRAME_SELECTOR = "#kplayer_ifp";
const VIDEO_PLAYER_SELECTOR = "#pid_kplayer";
const VIDEO_CONTROLS_CONTAINER_SELECTOR = "div.controlsContainer";
const BUTTON_LABEL = "Velocità video";
const PLAYBACK_RATES = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

/**
 * Main function to initialize the video speed selector.
 */
async function main() {
  // The video player is nested inside an iframe, so we need first to retrieve the iframe document.
  const iframe = await retrieveVideoIFrameDocument();

  const video = getVideoElement(iframe);
  const videoControls = await getVideoControlsElement(iframe);

  const playbackSpeedControl = createPlaybackSpeedControl(video);

  videoControls.appendChild(playbackSpeedControl);
}

main();

/**
 * Retrieves the document of the video iframe.
 * @returns {Promise<Document>} A promise that resolves with the iframe document.
 */
function retrieveVideoIFrameDocument() {
  return new Promise((resolve, reject) => {
    window.addEventListener("load", () => {
      const iframe = document.querySelector(IFRAME_SELECTOR);
      const iframeDocument = iframe?.contentDocument;
      if (iframeDocument) {
        resolve(iframeDocument);
      } else {
        reject(new Error("No iframe found"));
      }
    });
  });
}

/**
 * Gets the video element from the iframe document.
 * @param {Document} iframe - The iframe document.
 * @returns {HTMLVideoElement} The video element.
 * @throws Will throw an error if no video player is found.
 */
function getVideoElement(iframe) {
  const video = iframe.querySelector(VIDEO_PLAYER_SELECTOR);
  if (!video) {
    throw new Error("No video player found");
  }
  return video;
}

/**
 * Gets the video controls element from the iframe document.
 * The controls elements may not be immediately available, so we retry for a few times.
 * @param {Document} iframe - The iframe document.
 * @returns {Promise<Element>} A promise that resolves with the video controls element.
 * @throws Will throw an error if no video controls are found after 10 retries.
 */
async function getVideoControlsElement(iframe) {
  for (let retries = 0; retries < 10; retries++) {
    const videoControls = iframe.querySelector(VIDEO_CONTROLS_CONTAINER_SELECTOR);
    if (videoControls) {
      return videoControls;
    }
    await waitFor(200);
  }
  throw new Error("No video controls found");
}

/**
 * Creates the playback speed control element.
 * @param {HTMLVideoElement} videoElement - The video element.
 * @returns {HTMLDivElement} The playback speed control element.
 */
function createPlaybackSpeedControl(videoElement) {
  const div = createContainer();
  const ul = createDropdownMenu();
  const button = createButton(ul);

  const playbackRateListItems = createPlaybackRateListItems(videoElement, button, ul);

  div.appendChild(button);
  div.appendChild(ul);
  ul.append(...playbackRateListItems);

  return div;
}

/**
 * Creates a container div element for the playback speed control.
 * @returns {HTMLDivElement} The container div element.
 */
function createContainer() {
  const div = window.document.createElement("div");
  div.className = "dropup comp closedCaptions pull-right display-high";
  return div;
}

/**
 * Creates a dropdown menu element for the playback speed options.
 * @returns {HTMLUListElement} The dropdown menu element.
 */
function createDropdownMenu() {
  const ul = window.document.createElement("ul");
  ul.className = "dropdown-menu";
  ul.setAttribute("aria-expanded", "false");
  ul.setAttribute("role", "menu");
  ul.setAttribute("aria-labelledby", BUTTON_LABEL);
  ul.id = "ui-id-2";
  return ul;
}

/**
 * Creates a button element for the playback speed control.
 * @param {HTMLUListElement} ul - The dropdown menu element.
 * @returns {HTMLButtonElement} The button element.
 */
function createButton(ul) {
  const button = window.document.createElement("button");
  button.className = "btn";
  button.title = BUTTON_LABEL;
  button.textContent = "x1";
  button.setAttribute("aria-label", BUTTON_LABEL);
  button.setAttribute("aria-haspopup", "true");
  button.setAttribute("data-show-tooltip", "true");
  button.tabIndex = 3;

  button.addEventListener("click", () => toggleMenu(ul));

  return button;
}

/**
 * Creates list items for each playback rate option.
 * @param {HTMLVideoElement} videoElement - The video element.
 * @param {HTMLButtonElement} button - The button element.
 * @param {HTMLUListElement} ul - The dropdown menu element.
 * @returns {HTMLLIElement[]} An array of list item elements.
 */
function createPlaybackRateListItems(videoElement, button, ul) {
  return PLAYBACK_RATES.map((rate) => {
    const label = `x${rate}`;
    const liRate = window.document.createElement("li");
    const aRate = window.document.createElement("a");
    aRate.href = "#";
    aRate.title = label;
    aRate.setAttribute("role", "menuitemcheckbox");
    aRate.setAttribute("aria-checked", "false");
    aRate.tabIndex = 3.02;
    aRate.textContent = label;
    aRate.addEventListener("click", (event) => handleRateChange(event, videoElement, button, ul));
    liRate.appendChild(aRate);
    return liRate;
  });
}

/**
 * Toggles the visibility of the dropdown menu.
 * @param {HTMLUListElement} ul - The dropdown menu element.
 */
function toggleMenu(ul) {
  const isOpen = ul.getAttribute("aria-expanded") === "true";
  ul.setAttribute("aria-expanded", !isOpen);
  ul.classList.toggle("open");
}

/**
 * Handles the playback rate change event.
 * @param {Event} event - The event object.
 * @param {HTMLVideoElement} videoElement - The video element.
 * @param {HTMLButtonElement} button - The button element.
 * @param {HTMLUListElement} ul - The dropdown menu element.
 */
function handleRateChange(event, videoElement, button, ul) {
  event.preventDefault();
  const rate = parseFloat(event.target.textContent.slice(1));

  const changeRate = () => {
    videoElement.playbackRate = rate;
  };

  if (videoElement.paused) {
    videoElement.addEventListener("play", changeRate, { once: true });
  } else {
    changeRate();
  }

  button.textContent = event.target.textContent;
  const listItems = ul.querySelectorAll("li a");
  listItems.forEach((a) => {
    a.setAttribute("aria-checked", "false");
  });
  event.target.setAttribute("aria-checked", "true");
  toggleMenu(ul);
}

/**
 * Waits for a specified amount of time.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 */
async function waitFor(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
