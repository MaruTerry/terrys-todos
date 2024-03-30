import * as vscode from "vscode";
import { CustomTreeItem, getAllData, updateDataInWorkspace } from "./customTreeItem";
import { Todo } from "./todo";
import { getNonce } from "../util/getNonce";

/**
 * Interface representing a Folder, containing the type "Folder", an id string, a label string, a folders array and a todos array.
 */
export interface Folder {
    type: "Folder";
    id: string;
    label: string;
    folders: Folder[];
    todos: Todo[];
}

/**
 * Gets a folder defined by the given id from the given data.
 *
 * @param id - The id of the folder to find.
 * @param data - The data to find the folder in.
 * @returns A promise that resolves into the needed folder or undefined if no matching id was found.
 */
export async function getFolderById(id: string, data: (Todo | Folder)[]): Promise<Folder | undefined> {
    for (const item of data) {
        if (item.type === "Folder" && item.id === id) {
            return item as Folder;
        }
        if (item.type === "Folder") {
            const folder = findFolderInFolder(item, id);
            if (folder) {
                return folder;
            }
        }
    }
    return undefined;
}

/**
 * Helper function to recursively search for a folder within a folder.
 *
 * @param folder - The folder to search within.
 * @param id - The id of the folder to find.
 * @returns The folder if found, otherwise undefined.
 */
function findFolderInFolder(folder: Folder, id: string): Folder | undefined {
    for (const tmpFolder of folder.folders) {
        if (tmpFolder.id === id) {
            return tmpFolder;
        }
    }
    // Recursively search within subfolders
    for (const subfolder of folder.folders) {
        const foundFolder = findFolderInFolder(subfolder, id);
        if (foundFolder) {
            return foundFolder;
        }
    }
    return undefined;
}

/**
 * Creates a new folder on the base level.
 */
export async function createBaseFolder() {
    let data: (Todo | Folder)[] = await getAllData();
    let folderLabel = await vscode.window.showInputBox({ prompt: "Enter the folder label" });
    if (folderLabel && data) {
        const newFolder: Folder = {
            type: "Folder",
            id: getNonce(),
            label: folderLabel,
            folders: [],
            todos: [],
        };
        data.push(newFolder);
        await updateDataInWorkspace(data);
    }
}

/**
 * Creates a new folder on in the folder given by the id.
 *
 * @param treeItem - The CustomTreeItem representing the the target folder.
 */
export async function createFolder(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getAllData();
    let folderLabel = await vscode.window.showInputBox({ prompt: "Enter the folder label" });
    if (data && folderLabel && treeItem.id) {
        let folderToEdit = await getFolderById(treeItem.id, data);
        if (folderToEdit !== undefined) {
            const newFolder: Folder = {
                type: "Folder",
                id: getNonce(),
                label: folderLabel,
                folders: [],
                todos: [],
            };
            folderToEdit.folders.push(newFolder);
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Edits a folder label.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be edited.
 */
export async function editFolderLabel(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getAllData();
    let newLabel = await vscode.window.showInputBox({
        value: treeItem.label?.toString(),
        prompt: "Edit the folder label",
    });
    if (data && newLabel && treeItem.id) {
        let folderToEdit = await getFolderById(treeItem.id, data);
        if (folderToEdit !== undefined) {
            folderToEdit.label = newLabel;
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Deletes a folder defined by the given id.
 *
 * @param id - The id of the folder to delete.
 * @returns A promise that resolves when the folder is deleted.
 */
export async function deleteFolderById(id: string): Promise<void> {
    let data: (Todo | Folder)[] = await getAllData();
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === "Folder") {
            if (item.id === id) {
                data.splice(i, 1);
                await updateDataInWorkspace(data);
                return;
            } else {
                if (removeFolderRecursively(item, id)) {
                    await updateDataInWorkspace(data);
                    return;
                }
            }
        }
    }
}

/**
 * Helper function to recursively search for and remove a folder within a folder.
 *
 * @param folder - The folder to search within.
 * @param id - The id of the folder to remove.
 * @returns True if the folder was removed, otherwise false.
 */
function removeFolderRecursively(folder: Folder, id: string): boolean {
    for (let i = 0; i < folder.folders.length; i++) {
        if (folder.folders[i].id === id) {
            // Remove the todo from the folder's todos
            folder.folders.splice(i, 1);
            return true;
        }
    }
    for (const subfolder of folder.folders) {
        if (removeFolderRecursively(subfolder, id)) {
            return true;
        }
    }
    return false;
}

/**
 * Deletes all empty folders (folders containing no folders and no todos).
 */
export async function deleteEmptyFolders() {
    let data: (Todo | Folder)[] = await getAllData();
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === "Folder") {
            if (item.todos.length === 0 && item.folders.length === 0) {
                data.splice(i, 1);
                await updateDataInWorkspace(data);
                deleteEmptyFolders();
            }
        }
    }
}
