import * as vscode from "vscode";
import { getNonce } from "../util/getNonce";

export class CreateTodoWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "create-todo";

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.command) {
                case "createToDo": {
                    vscode.window.showInformationMessage('ToDo "' + data.todo + '" created!');
                    break;
                }
                case "showError": {
                    vscode.window.showErrorMessage(data.message);
                }
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "createToDoWebview.js")
        );

        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.css"));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
  
                  <!--
                      Use a content security policy to only allow loading styles from our extension directory,
                      and only allow scripts that have a specific nonce.
                      (See the 'webview-sample' extension sample for img-src content security policy examples)
                  -->
                  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
                  <link href="${styleResetUri}" rel="stylesheet">
                  <link href="${styleVSCodeUri}" rel="stylesheet">
                  <link href="${styleMainUri}" rel="stylesheet">
  
                  <title>Create Project</title>
              </head>
              <body>
                  <input id="create-todo-input" placeholder="Define the ToDo..."></input>
  
                  <button id="create-todo-button">Create ToDo</button>
  
                  <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
              </html>`;
    }
}
