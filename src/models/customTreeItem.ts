import * as vscode from "vscode";
import { Todo } from "./todo";
import { Folder } from "./folder";

/**
 * Custom interface extending vscode.TreeItem to include additional properties.
 */
export interface CustomTreeItem extends vscode.TreeItem {
    description?: string | boolean;
    text?: string;
    done?: boolean;
    folders?: Folder[];
    todos?: Todo[];
}

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
