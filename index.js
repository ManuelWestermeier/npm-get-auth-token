"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubToken = getGithubToken;
/**
 * Opens a full-screen iframe to perform GitHub OAuth and returns the access token.
 * @returns {Promise<string>} Resolves with the GitHub access token
 */
function getGithubToken() {
  return new Promise(function (resolve, reject) {
    var iframe = document.getElementById("gh-auth-iframe");
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
    var appUrl = window.location.origin + window.location.pathname;
    iframe.src =
      "https://gh-authtoken-test.onrender.com/github/login?appUrl=".concat(
        encodeURIComponent(appUrl)
      );
    var handleMessage = function (event) {
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
    setTimeout(function () {
      window.removeEventListener("message", handleMessage);
      iframe.remove();
      reject(new Error("OAuth timed out after 2 minutes"));
    }, 120000);
  });
}
