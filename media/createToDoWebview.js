// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const createToDoButton = document.getElementById("create-todo-button");
    const createToDoInput = document.getElementById("create-todo-input");

    createToDoButton.addEventListener("click", () => {
        const todo = createToDoInput.value;
        if (todo) {
            vscode.postMessage({ command: "createToDo", todo });
        } else {
            // Handle case where no project name is provided
            vscode.postMessage({
                command: "showError",
                message: "ToDo has to be defined.",
            });
        }
    });

    const refreshButton = document.getElementById("refresh-button");

    refreshButton.addEventListener("click", () => {
        vscode.postMessage({
            command: "refresh",
        });
    });
})();
