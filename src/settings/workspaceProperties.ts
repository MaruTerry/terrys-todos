import * as vscode from "vscode";
import { Folder } from "../interfaces/folder";
import { Todo } from "../interfaces/todo";

/**
 * Returns all todos and folders.
 *
 * @returns A promise for an array of todos and folders.
 */
export async function getAllData(): Promise<(Todo | Folder)[]> {
    const data: (Todo | Folder)[] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.data");
    if (data) {
        return data;
    }
    return [];
}

/**
 * Returns all done todos.
 *
 * @returns A promise for an array of done todos.
 */
export async function getAllDoneTodos(): Promise<Todo[]> {
    const data: Todo[] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.done-todos");
    if (data) {
        return data;
    }
    return [];
}

/**
 * Updates all todos and folders in the workspace.
 *
 * @param newData - The new data.
 */
export async function updateDataInWorkspace(newData: (Todo | Folder)[]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-todos.data", newData, vscode.ConfigurationTarget.Workspace);
}

/**
 * Updates all done todos and folders in the workspace.
 *
 * @param newData - The new data.
 */
export async function updateDoneTodosInWorkspace(newData: Todo[]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-todos.done-todos", newData, vscode.ConfigurationTarget.Workspace);
}

/**
 * Returns the sorting type.
 *
 * @returns A promise that resolves into the sorting type ("date" or "color") or undefined if nothing was found.
 */
export async function getSortingMode(): Promise<string | undefined> {
    return await vscode.workspace.getConfiguration().get("terrys-todos.sortingMode");
}

/**
 * Updates all done todos and folders in the workspace.
 *
 * @param newData - The new sorting mode (either "date" or "color").
 */
export async function setSortingMode(sortingMode: string) {
    if (sortingMode === "date" || sortingMode === "color") {
        await vscode.workspace
            .getConfiguration()
            .update("terrys-todos.sortingMode", sortingMode, vscode.ConfigurationTarget.Workspace);
    }
}

/**
 * Returns true if dates should be shown otherwise false.
 *
 * @returns A Promise that resolved into a boolean.
 */
export async function showDates(): Promise<boolean> {
    if ((await vscode.workspace.getConfiguration().get("terrys-todos.showDates")) === true) {
        return true;
    }
    return false;
}

/**
 * Returns true if done todos should only be included once in the generated commit message, false otherwise.
 *
 * @returns A Promise that resolved into a boolean.
 */
export async function includeDoneTodosOnce(): Promise<boolean> {
    if ((await vscode.workspace.getConfiguration().get("terrys-todos.includeDoneTodosOnce")) === true) {
        return true;
    }
    return false;
}

/**
 * Returns true if done todos should be deleted after beeing included in the generated commit message, false otherwise.
 *
 * @returns A Promise that resolved into a boolean.
 */
export async function deleteIncludedTodos(): Promise<boolean> {
    if ((await vscode.workspace.getConfiguration().get("terrys-todos.deleteIncludedTodos")) === true) {
        return true;
    }
    return false;
}
