import * as vscode from "vscode";
import { CustomTreeItem } from "../interfaces/customTreeItem";
import { isWorkspaceOpened } from "../util/workspaceChecker";
import { createBaseFolder, createFolder, deleteFolderById, editFolderLabel } from "../logic/folder";
/**
 * Registers all commands related to folders.
 *
 * @param context - The extension context.
 */
export function registerFolderCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createBaseFolder", () => {
            if (isWorkspaceOpened()) {
                createBaseFolder();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createFolder", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                createFolder(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editFolderLabel", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                editFolderLabel(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteFolder", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                if (treeItem.id) {
                    deleteFolderById(treeItem.id);
                }
            }
        })
    );
}
