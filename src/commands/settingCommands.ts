import * as vscode from "vscode";
import { setSortingMode, getAllData, updateDataInWorkspace } from "../settings/workspaceProperties";
import { sortTodosByColor } from "../util/sortByColor";
import { sortTodosByDate } from "../util/sortByDate";
import { isWorkspaceOpened } from "../util/workspaceChecker";

/**
 * Registers all commands related to settings (like description toggle or sorting modes).
 *
 * @param context - The extension context.
 */
export function registerSettingCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.toggleDates", async () => {
            if (isWorkspaceOpened()) {
                if ((await vscode.workspace.getConfiguration().get("terrys-todos.showDates")) === true) {
                    await vscode.workspace
                        .getConfiguration()
                        .update("terrys-todos.showDates", false, vscode.ConfigurationTarget.Workspace);
                } else {
                    await vscode.workspace
                        .getConfiguration()
                        .update("terrys-todos.showDates", true, vscode.ConfigurationTarget.Workspace);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setSortingModeDate", async () => {
            if (isWorkspaceOpened()) {
                await setSortingMode("date");
                const data = await getAllData();
                await sortTodosByDate(data);
                await updateDataInWorkspace(data);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setSortingModeColor", async () => {
            if (isWorkspaceOpened()) {
                await setSortingMode("color");
                const data = await getAllData();
                await sortTodosByColor(data);
                await updateDataInWorkspace(data);
            }
        })
    );
}
