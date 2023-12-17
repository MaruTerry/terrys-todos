// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const refreshButton = document.getElementById("refresh-button");

    refreshButton.addEventListener("click", () => {
        vscode.postMessage({
            command: "refresh",
        });
    });
})();
