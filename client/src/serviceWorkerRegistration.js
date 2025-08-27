export function register() {
  if ("serviceWorker" in navigator) {
    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      /^127(?:\.(?:\d{1,3})){3}$/.test(window.location.hostname)
    );

    window.addEventListener("load", () => {
      const swUrl = `/service-worker.js`;

      if (isLocalhost || window.location.protocol === "https:") {
        navigator.serviceWorker
          .register(swUrl, { scope: "/" })
          .then((registration) => {
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (!installingWorker) return;
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New content is available; please refresh.");
                  } else {
                    console.log("Content cached for offline use.");
                  }
                }
              };
            };
          })
          .catch((error) => {
            console.error("SW registration failed:", error);
          });
      }
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
