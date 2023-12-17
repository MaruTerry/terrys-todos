import * as vscode from "vscode";
import { getNonce } from "../util/getNonce";

export class ShowTodosWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "show-todos";

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        this._getHtmlForWebview(webviewView.webview).then((html) => {
            webviewView.webview.html = html;
        });

        webviewView.webview.onDidReceiveMessage(this._handleWebviewMessage.bind(this));
    }

    private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        try {
            // Read and parse todos
            const todos = await this._readAndParseTodos();

            // Generate HTML for todos
            const todoListHtml = todos
                .map((todo) => {
                    const isDone = todo.startsWith("-");
                    const todoText = isDone ? todo.substring(1) : todo.substring(1);
                    const todoClass = isDone ? "done" : "not-done";

                    return `<li class="${todoClass}">${todoText}</li>`;
                })
                .join("");

            // Get URIs for resources
            const scriptUri = webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "media", "showToDosWebview.js")
            );
            const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
            const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
            const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.css"));

            // Use a nonce to only allow a specific script to be run.
            const nonce = getNonce();

            return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                    <link href="${styleMainUri}" rel="stylesheet">
                </head>
                <body>
                <ul class="todos">${todoListHtml}</ul>
                <button id="refresh-button">Refresh</button>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
                </html>`;
        } catch (error) {
            console.error("Error generating HTML for webview:", error);
            return "Error";
        }
    }

    private async _readAndParseTodos(): Promise<string[]> {
        try {
            // Check if there is an open workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                console.error("No workspace folder is open.");
                return [];
            }

            // Get the first workspace folder (you may need to adjust this based on your requirements)
            const workspaceFolder = workspaceFolders[0];

            // Construct the path to the .todo file within the workspace folder
            const todoFilePath = vscode.Uri.joinPath(workspaceFolder.uri, ".todo");

            // Read the content of the file
            const buffer = await vscode.workspace.fs.readFile(todoFilePath);
            const fileContent = buffer.toString();
            const todos = fileContent.split(";");
            return todos;
        } catch (error) {
            console.error("Error reading .todo file:", error);
            return [];
        }
    }

    private _handleWebviewMessage(data: any): void {
        switch (data.command) {
            case "refresh":
                this._refreshWebview();
                break;
        }
    }

    private async _refreshWebview() {
        if (this._view) {
            const html = await this._getHtmlForWebview(this._view.webview);
            this._view.webview.html = html;
            vscode.window.showInformationMessage("ToDos refreshed!");
        }
    }
}
