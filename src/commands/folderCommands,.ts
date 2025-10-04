import * as vscode from "vscode";
import { isWorkspaceOpened } from "../util/workspace";
import { createBaseFolder, createFolder, deleteFolderById, editFolderLabel } from "../logic/folder";
import { CustomTreeItem } from "../interfaces/interfaces";

/**
 * Registers all commands related to folders.
 *
 * @param context - The extension context.
 */
export function registerFolderCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createBaseFolder", () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            createBaseFolder();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createFolder", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            createFolder(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editFolderLabel", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            editFolderLabel(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteFolder", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened() || treeItem.id === undefined) {
                return;
            }
            deleteFolderById(treeItem.id);
        })
    );
}
