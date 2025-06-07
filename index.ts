/**
 * Opens a full-screen iframe to perform GitHub OAuth and returns the access token.
 * @returns {Promise<string>} Resolves with the GitHub access token
 */
export function getGithubToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    let iframe = document.getElementById("gh-auth-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "gh-auth-iframe";
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
      iframe.style.border = "none";
      iframe.style.zIndex = "9999";
      document.body.appendChild(iframe);
    }

    const appUrl = window.location.origin + window.location.pathname;
    iframe.src = `https://gh-authtoken-test.onrender.com/github/login?appUrl=${encodeURIComponent(
      appUrl
    )}`;

    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.data === "string" &&
        event.data.startsWith("gh-token:")
      ) {
        window.removeEventListener("message", handleMessage);
        iframe.remove();
        resolve(event.data.replace("gh-token:", ""));
      }
    };

    window.addEventListener("message", handleMessage);

    // Timeout in case of failure
    setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      iframe.remove();
      reject(new Error("OAuth timed out after 2 minutes"));
    }, 120000);
  });
}
