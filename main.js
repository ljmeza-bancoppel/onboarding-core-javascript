import { fakeBackendStart, fakeBackendFinish } from './fake_backend'

let incode;
let incodeSession;
let showTutorialsFlag = true;
const cameraContainer = document.getElementById("camera-container");

function showError(e = null) {
  const finishContainer = document.getElementById("finish-container");
  if (e?.message) {
    finishContainer.innerHTML = `<h1>Error: ${e.message}</h1>`;
  } else {
    finishContainer.innerHTML = "<h1>There was an error</h1>";
    console.log(e);
  }
}

function saveDeviceData() {
  // incode.sendGeolocation({ token: incodeSession.token });
  incode.sendFingerprint({ token: incodeSession.token });
  capturePoA();
}

function captureDocuments() {
  incode.renderDocumentSelector(cameraContainer, {
    onSuccess: capturePoA,
    onError: showError,
    token: incodeSession,
    numberOfTries: 3,
    showTutorial: showTutorialsFlag
  });
}

function captureIdFrontSide() {
  incode.renderCamera("front", cameraContainer, {
    onSuccess: captureIdBackSide,
    onError: showError,
    token: incodeSession,
    numberOfTries: 3,
    showTutorial: showTutorialsFlag
  });
}

function captureIdBackSide(response) {
  incode.renderCamera("back", cameraContainer, {
    onSuccess: processId,
    onError: showError,
    token: incodeSession,
    numberOfTries: 3,
    showTutorial: showTutorialsFlag
  });
}

async function processId() {
  const results = await incode.processId({
    token: incodeSession.token,
  });
  console.log("processId results", results);
  captureSelfie();
}

function captureSelfie() {
  incode.renderCamera("selfie", cameraContainer, {
    onSuccess: finishOnboarding,
    onError: showError,
    token: incodeSession,
    numberOfTries: 3,
    showTutorial: showTutorialsFlag
  });
}

function capturePoA() {
  incode.renderCamera("document", cameraContainer, {
    onSuccess: finishOnboarding,
    onError: showError,
    token: incodeSession,
    nativeCamera: false,
    disableFullScreen: false,
    fullScreen: true,
    showPreview: false,
    numberOfTries: 3,
    showTutorial: showTutorialsFlag
  });
}

function finishOnboarding() {
  // Finishing the session works along with the configuration in the flow
  // webhooks and business rules are ran here.
  fakeBackendFinish(incodeSession.token)
    .then((response) => {
      console.log(response);
      const container = document.getElementById("finish-container");
      container.innerHTML = "<h1>Onboarding Finished.</h1>";
    })
    .catch((e) => {
      showError(e);
    });
}

async function app() {
  console.log("VITE_API_URL", import.meta.env.VITE_API_URL);
  console.log("VITE_API_KEY", import.meta.env.VITE_FAKE_BACKEND_APIKEY);
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const apiKey = atob(import.meta.env.VITE_FAKE_BACKEND_APIKEY);
    incode = window.OnBoarding.create({
      apiURL: apiURL,
      apiKey: apiKey,
    });

    // Create the single session
    cameraContainer.innerHTML = "<h1>Creating session...</h1>";
    incodeSession = await fakeBackendStart();
    // Empty the container and start the flow
    cameraContainer.innerHTML = "";
    console.log("incodeSession:", incodeSession);
    saveDeviceData();
  } catch (e) {
    showError(e);
  }
}

document.addEventListener("DOMContentLoaded", app);
