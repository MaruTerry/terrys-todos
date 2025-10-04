import * as vscode from "vscode";
import { setSortingMode, getTodos, updateDataInWorkspace, toggleShowDates } from "../settings/workspaceProperties";
import { sortTodosByColor } from "../util/sortByColor";
import { sortTodosByDate } from "../util/sortByDate";
import { isWorkspaceOpened } from "../util/workspace";
import { SortingMode } from "../interfaces/enums";

/**
 * Registers all commands related to settings (like description toggle or sorting modes).
 *
 * @param context - The extension context.
 */
export function registerSettingCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.toggleDates", async () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await toggleShowDates();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setSortingModeDate", async () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setSortingMode(SortingMode.DATE);
            const data = await getTodos();
            await sortTodosByDate(data);
            await updateDataInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setSortingModeColor", async () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setSortingMode(SortingMode.COLOR);
            const data = await getTodos();
            await sortTodosByColor(data);
            await updateDataInWorkspace(data);
        })
    );
}
