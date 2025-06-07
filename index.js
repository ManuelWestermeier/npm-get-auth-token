// index.js

/**
 * Opens a full-screen iframe to perform GitHub OAuth and returns the access token.
 * @returns {Promise<string>} Resolves with the GitHub access token
 */
export async function getGithubToken() {
  return new Promise((resolve, reject) => {
    // Create or reuse the iframe
    let iframe = document.getElementById("gh-auth-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "gh-auth-iframe";
      Object.assign(iframe.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        border: "none",
        zIndex: "9999",
        display: "none",
      });
      document.body.appendChild(iframe);
    }

    // Construct auth URL
    const appUrl = window.location.origin + window.location.pathname;
    const authUrl = `https://gh-authtoken-test.onrender.com/github/login?appUrl=${encodeURIComponent(
      appUrl
    )}`;

    // Message handler
    const onMessage = (event) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (typeof data === "string" && data.startsWith("gh-token:")) {
        const token = data.replace("gh-token:", "");
        cleanup();
        resolve(token);
      }
    };

    // Cleanup on success or timeout
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timeout);
      iframe.style.display = "none";
    };

    // Setup timeout
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("OAuth timed out"));
    }, 2 * 60 * 1000); // 2-minute timeout

    // Start listening and show iframe
    window.addEventListener("message", onMessage);
    iframe.src = authUrl;
    iframe.style.display = "block";
  });
}
