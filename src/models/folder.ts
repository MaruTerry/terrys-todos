import * as vscode from "vscode";
import { CustomTreeItem } from "./customTreeItem";
import { getAllTodos, updateTodosInWorkspace } from "./todo";

/**
 * Interface representing a Folder, containing a label string and a subPath string.
 */
export interface Folder {
    label: string;
    subPath: string;
}

/**
 * Returns all existing folders.
 *
 * @returns A promise for an array of folders
 */
export async function getAllFolders(): Promise<Folder[]> {
    let folders: Folder[] = [];
    const foldersAsArrays: string[][] | undefined = await vscode.workspace
        .getConfiguration()
        .get("terrys-todos.folders");
    if (foldersAsArrays) {
        foldersAsArrays.forEach((arrayFolder) => {
            folders.push({
                label: arrayFolder[0],
                subPath: arrayFolder[1],
            });
        });
    }
    return folders;
}

/**
 * Returns the index of the first folder name that matched the given string.
 *
 * @param folderName - The folder name as a string
 * @returns A the index as a number or undefined if no matches were found
 */
export async function getIndexOfFolder(folderName: string): Promise<number | undefined> {
    let index = undefined;
    let folder: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.folders");
    if (folder) {
        folder.forEach((arrayFolder) => {
            if (arrayFolder[0] === folderName) {
                index = folder?.indexOf(arrayFolder);
            }
        });
    }
    return index;
}

/**
 * Updates all folders in the workspace.
 *
 * @param folderText - The new folders
 */
export async function updateFoldersInWorkspace(newFolders: string[][]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-todos.folders", newFolders, vscode.ConfigurationTarget.Workspace);
}

/**
 * Creates a folder.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be created
 */
export async function createFolder() {
    let label = await vscode.window.showInputBox({ prompt: "Enter the label" });
    let folders: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.folders");
    if (label && folders) {
        folders.push([label, "/"]);
        await updateFoldersInWorkspace(folders);
    }
}

/**
 * Rename a folder.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be renamed
 */
export async function renameFolder(treeItem: CustomTreeItem) {
    let folders: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.folders");
    let nameOfFolderToEdit = treeItem.label?.toString();
    let newName = await vscode.window.showInputBox({
        value: treeItem.label?.toString(),
        prompt: "Edit the folder name",
    });
    while (newName?.includes("/")) {
        newName = await vscode.window.showInputBox({
            value: treeItem.label?.toString(),
            prompt: 'No "/" allowed. Edit the folder name',
        });
    }
    if (folders && nameOfFolderToEdit && newName) {
        let indexOfFolderToEdit = await getIndexOfFolder(nameOfFolderToEdit);
        if (indexOfFolderToEdit !== undefined) {
            folders[indexOfFolderToEdit][0] = newName;
            // adjust affected subPaths
            for (let i = 0; i < folders.length; i++) {
                folders[i][1] = folders[i][1].replace("/" + nameOfFolderToEdit + "/", "/" + newName + "/");
            }
            let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
            if (todos) {
                for (let i = 0; i < todos.length; i++) {
                    todos[i][3] = todos[i][3].replace("/" + nameOfFolderToEdit + "/", "/" + newName + "/");
                }
                await updateTodosInWorkspace(todos);
            }
            await updateFoldersInWorkspace(folders);
        }
    }
}

/**
 * Delete a folder.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be deleted
 */
export async function deleteFolder(treeItem: CustomTreeItem) {
    let folders: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.folders");
    let nameOfFolderToDelete = treeItem.label?.toString();
    if (folders && nameOfFolderToDelete) {
        let indexOfFolderToDelete = await getIndexOfFolder(nameOfFolderToDelete);
        if (indexOfFolderToDelete !== undefined) {
            folders.splice(indexOfFolderToDelete, 1);
            // delete sub folders and todos
            folders.forEach((arrayFolder) => {
                if (folders && nameOfFolderToDelete) {
                    if (arrayFolder[1].includes("/" + nameOfFolderToDelete + "/")) {
                        folders.splice(folders?.indexOf(arrayFolder), 1);
                    }
                }
            });
            let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
            if (todos) {
                todos.forEach((arrayTodo) => {
                    if (todos && nameOfFolderToDelete) {
                        if (arrayTodo[3].includes("/" + nameOfFolderToDelete + "/")) {
                            todos.splice(todos?.indexOf(arrayTodo), 1);
                        }
                    }
                });
                await updateTodosInWorkspace(todos);
            }
            await updateFoldersInWorkspace(folders);
        }
    }
}
