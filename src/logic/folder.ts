import * as vscode from "vscode";
import {
    getTodos,
    updateTodosInWorkspace,
    getDoneTodos,
    updateDoneTodosInWorkspace,
} from "../settings/workspaceProperties";
import { findTodoInFolder, deleteTodoById, updateTodoFolderPaths } from "./todo";
import { Todo, Folder, CustomTreeItem, createFolderObject } from "../interfaces/interfaces";
import { Type } from "../interfaces/enums";

/**
 * Gets a folder defined by the given id from the given data.
 *
 * @param id - The id of the folder to find.
 * @param data - The data to find the folder in.
 * @returns A promise that resolves into the needed folder or undefined if no matching id was found.
 */
export async function getFolderById(id: string, data: (Todo | Folder)[]): Promise<Folder | undefined> {
    for (const item of data) {
        if (item.type === Type.FOLDER && item.id === id) {
            return item as Folder;
        }
        if (item.type === Type.FOLDER) {
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
export function findFolderInFolder(folder: Folder, id: string): Folder | undefined {
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
 * Gets the parent folder of a todo or folder by its id.
 *
 * @param data - The array of todos and folders.
 * @param id - The id of the todo or folder whose parent folder is to be found.
 * @returns The parent folder if found, otherwise undefined.
 */
export function getParentFolderById(data: (Todo | Folder)[], id: string): Folder | undefined {
    for (const item of data) {
        if (item.type === "Folder") {
            let itemInFolder: Todo | Folder | undefined = item.todos.find((todo) => todo.id === id);
            if (itemInFolder) {
                return item;
            }
            itemInFolder = item.folders.find((folder) => folder.id === id);
            if (itemInFolder) {
                return item;
            }
            const parentFolder = getParentFolderById(item.folders, id);
            if (parentFolder) {
                return parentFolder;
            }
        }
    }
    return undefined;
}

/**
 * Checks if a folder contains the object with the given id.
 *
 * @param folder - The folder to search in.
 * @param id - The id of the object to search.
 * @returns True if the item was found, false otherwise.
 */
export function folderContainsItem(folder: Folder, id: string) {
    const foundFolderInFolder = findFolderInFolder(folder, id);
    const foundTodoInFolder = findTodoInFolder(folder, id);
    if (foundTodoInFolder !== undefined || foundFolderInFolder !== undefined) {
        return true;
    }
    return false;
}

/**
 * Creates a new folder on the base level.
 */
export async function createBaseFolder() {
    let data: (Todo | Folder)[] = await getTodos();
    let folderLabel = await vscode.window.showInputBox({ prompt: "Enter the folder label" });
    if (folderLabel && data) {
        const newFolder = createFolderObject(folderLabel);
        data.push(newFolder);
        await updateTodosInWorkspace(data);
    }
}

/**
 * Creates a new folder on in the folder given by the id.
 *
 * @param treeItem - The CustomTreeItem representing the the target folder.
 */
export async function createFolder(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getTodos();
    let folderLabel = await vscode.window.showInputBox({ prompt: "Enter the folder label" });
    if (data && folderLabel && treeItem.id) {
        let folderToEdit = await getFolderById(treeItem.id, data);
        if (folderToEdit !== undefined) {
            const newFolder = createFolderObject(folderLabel);
            folderToEdit.folders.push(newFolder);
            await updateTodosInWorkspace(data);
        }
    }
}

/**
 * Edits a folder label.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be edited.
 */
export async function editFolderLabel(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getTodos();
    let newLabel = await vscode.window.showInputBox({
        value: treeItem.label?.toString(),
        prompt: "Edit the folder label",
    });
    if (data && newLabel && treeItem.id && treeItem.label) {
        let folderToEdit = await getFolderById(treeItem.id, data);
        if (folderToEdit !== undefined) {
            folderToEdit.label = newLabel;
            await updateTodoFolderPaths(data, []);
            await updateTodosInWorkspace(data);
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
    let data: (Todo | Folder)[] = await getTodos();
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === Type.FOLDER) {
            if (item.id === id) {
                data.splice(i, 1);
                await updateTodosInWorkspace(data);
                return;
            } else {
                if (removeFolderRecursively(item, id)) {
                    await updateTodosInWorkspace(data);
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
    let data: (Todo | Folder)[] = await getTodos();
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === Type.FOLDER) {
            if (item.todos.length === 0 && item.folders.length === 0) {
                data.splice(i, 1);
                await updateTodosInWorkspace(data);
                deleteEmptyFolders();
            }
        }
    }
}

/**
 * Moves a folder into another folder.
 *
 * @param folderId - The id of the folder to move.
 * @param targetFolderId - The id of the folder to move the folder into.
 */
export async function moveFolderById(folderId: string, targetFolderId?: string) {
    let data: (Todo | Folder)[] = await getTodos();
    const folderToMove = await getFolderById(folderId, data);
    const currentFolder = getParentFolderById(data, folderId);
    if (folderToMove) {
        if (targetFolderId) {
            const targetFolder = await getFolderById(targetFolderId, data);
            if (targetFolder) {
                if (currentFolder) {
                    currentFolder.folders = currentFolder.folders.filter((folder) => folder.id !== folderId);
                } else {
                    data = data.filter((folder) => folder.id !== folderId);
                }
                targetFolder.folders.push(folderToMove);
                await updateTodoFolderPaths(data, []);
                await updateTodosInWorkspace(data);
            }
        } else {
            if (currentFolder) {
                currentFolder.folders = currentFolder.folders.filter((folder) => folder.id !== folderId);
            } else {
                data = data.filter((folder) => folder.id !== folderId);
            }
            data.push(folderToMove);
            await updateTodoFolderPaths(data, []);
            await updateTodosInWorkspace(data);
        }
    }
}

/**
 * Marks all todos inside the given folder as done.
 *
 * @param treeItem - The CustomTreeItem representing the folder.
 */
export async function setFolderDone(treeItem: CustomTreeItem) {
    let todos: (Todo | Folder)[] = await getTodos();
    let doneTodos: Todo[] = await getDoneTodos();
    if (treeItem.todos) {
        for (let todo of treeItem.todos) {
            deleteTodoById(todo.id, todos);
            doneTodos.push(todo);
        }
        await updateTodosInWorkspace(todos);
        await updateDoneTodosInWorkspace(doneTodos);
    }
    if (treeItem.folders) {
        for (let folder of treeItem.folders) {
            await setFolderDone(folder);
        }
    }
}
