import * as vscode from "vscode";

/**
 * Gets the current workspace folder name.
 *
 * @returns The name of the current workspace folder, or undefined if no workspace is opened.
 */
export function getCurrentWorkspaceFolder(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return workspaceFolders[0].name;
    }
    return undefined;
}

/**
 * Checks if a workspace is opened or not.
 *
 * @returns True if a workspace is currently opened, false otherwise.
 */
export function isWorkspaceOpened(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceOpened = workspaceFolders !== undefined && workspaceFolders.length > 0;
    if (!workspaceOpened) {
        vscode.window.showWarningMessage("You must have an open workspace to be able to use Terry's Todos");
    }
    return workspaceOpened;
}
