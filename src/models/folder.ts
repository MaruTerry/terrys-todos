import * as vscode from "vscode";
import { CustomTreeItem } from "./customTreeItem";
import { Todo } from "./todo";

/**
 * Interface representing a Folder, containing a label string and a subPath string.
 */
export interface Folder {
    type: "Folder";
    id: string;
    label: string;
    folder: Folder[];
    todos: Todo[];
}

/**
 * Returns all existing folders.
 *
 * @returns A promise for an array of folders.
 */
export async function getAllFolders(): Promise<Folder[]> {
    let folders: Folder[] = [];
    const dataStructure: (Todo | Folder)[] | undefined = await vscode.workspace
        .getConfiguration()
        .get("terrys-todos.data");
    console.log(dataStructure);
    if (dataStructure) {
        dataStructure.forEach((object) => {
            if (object.type === "Folder") folders.push(object as Folder);
        });
    }
    return folders;
}

/**
 * Returns the index of the first folder that matched the given string.
 *
 * @param folderLabel - The folder as a string.
 * @returns A the index as a number or undefined if no matches were found.
 */
export async function getIndexOfFolder(folderLabel: string): Promise<number | undefined> {
    let index = undefined;
    let folders: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.folders");
    if (folders) {
        folders.forEach((folderAsArray) => {
            if (folderAsArray[0] === folderLabel) {
                index = folders?.indexOf(folderAsArray);
            }
        });
    }
    return index;
}

/**
 * Creates a folder.
 *
 * @param superiorFolderLabel - The label of the folder containing the folder to create.
 */
export async function createFolder(superiorFolderLabel: string) {
    let label = await vscode.window.showInputBox({ prompt: "Enter the folder label" });
    let folders = await getAllFolders();
    if (label && folders) {
        folders.push({
            label: label,
            superiorFolderLabel: superiorFolderLabel,
        });
        await updateFoldersInWorkspace(folders);
    }
}

/**
 * Edits a folder label.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be edited.
 */
export async function editFolderLabel(treeItem: CustomTreeItem) {
    let folders = await getAllFolders();
    let labelOfFolderToEdit = treeItem.label?.toString();
    let newLabel = await vscode.window.showInputBox({ value: treeItem.label?.toString(), prompt: "Edit the todo" });
    if (folders && labelOfFolderToEdit && newLabel) {
        let indexOfTodoToEdit = await getIndexOfFolder(labelOfFolderToEdit);
        if (indexOfTodoToEdit !== undefined) {
            folders[indexOfTodoToEdit].label = newLabel;
            await updateFoldersInWorkspace(folders);
        }
    }
}

/**
 * Deletes a folder including all folders and todos it contains.
 *
 * @param treeItem - The CustomTreeItem representing the folder to be deleted.
 */
export async function deleteFolder(treeItem: CustomTreeItem) {
    let labelOfFolderToDelete = treeItem.label?.toString();
    let currentFolders = await getAllFolders();
    if (labelOfFolderToDelete && currentFolders) {
        let newFolders: Folder[] = [];
        currentFolders.forEach((folder) => {
            if (folder.label !== labelOfFolderToDelete) {
                newFolders.push(folder);
            }
        });
        await updateFoldersInWorkspace(newFolders);
    }
}
