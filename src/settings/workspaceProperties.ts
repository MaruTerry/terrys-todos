import * as vscode from "vscode";
import { Todo, Folder } from "../interfaces/interfaces";
import { getCurrentWorkspaceFolder } from "../util/workspace";
import { SortingMode } from "../interfaces/enums";

/**
 * Gets the configuration value for the given key.
 *
 * @param key - The configuration key.
 * @param defaultValue-  The default value.
 * @returns A promise that resolves into the configuration value or the default value.
 */
async function getConfiguration<T>(key: string, defaultValue: T, boundToWorkspace: boolean = true): Promise<T> {
    if (!boundToWorkspace) {
        const value = await vscode.workspace.getConfiguration().get("terrys-todos." + key);
        return value === undefined || value === null ? defaultValue : (value as T);
    }
    const value = await vscode.workspace.getConfiguration().get("terrys-todos." + key);
    const workspaceFolder = getCurrentWorkspaceFolder();
    if (value === undefined || value === null || workspaceFolder === undefined) {
        return defaultValue;
    }
    return value.hasOwnProperty(workspaceFolder) ? (value as Record<string, T>)[workspaceFolder] : defaultValue;
}

/**
 * Sets the configuration value for the given key.
 *
 * @param key - The configuration key.
 * @param value - The value to set.
 */
async function setConfiguration<T>(key: string, value: T, bindToWorkspace: boolean = true) {
    const valueWithWorkspace: Record<string, T> = {};
    if (bindToWorkspace) {
        const workspaceFolder = getCurrentWorkspaceFolder();
        if (workspaceFolder === undefined) {
            return;
        }
        valueWithWorkspace[workspaceFolder] = value;
    }
    await vscode.workspace
        .getConfiguration()
        .update("terrys-todos." + key, bindToWorkspace ? valueWithWorkspace : value, vscode.ConfigurationTarget.Global);
    return;
}

export async function getTodos(): Promise<(Todo | Folder)[]> {
    return await getConfiguration<(Todo | Folder)[]>("todos", []);
}

export async function getDoneTodos(): Promise<Todo[]> {
    return await getConfiguration<Todo[]>("donetodos", []);
}

export async function updateDataInWorkspace(newData: (Todo | Folder)[]) {
    await setConfiguration<(Todo | Folder)[]>("todos", newData);
}

export async function updateDoneTodosInWorkspace(newData: Todo[]) {
    await setConfiguration<Todo[]>("donetodos", newData);
}

export async function getSortingMode(): Promise<SortingMode> {
    return await getConfiguration<SortingMode>("sortingmode", SortingMode.COLOR, false);
}

export async function setSortingMode(sortingMode: SortingMode) {
    await setConfiguration<SortingMode>("sortingmode", sortingMode, false);
}

export async function showDates(): Promise<boolean> {
    return await getConfiguration<boolean>("showdates", false, false);
}

export async function toggleShowDates() {
    const currentValue = await showDates();
    await setConfiguration<boolean>("showdates", !currentValue, false);
}

export async function includeDoneTodosOnce(): Promise<boolean> {
    return await getConfiguration<boolean>("includedonetodosonce", true, false);
}

export async function deleteIncludedTodos(): Promise<boolean> {
    return await getConfiguration<boolean>("deleteincludedtodos", false, false);
}
