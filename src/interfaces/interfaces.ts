import * as vscode from "vscode";
import { getNonce } from "../util/getNonce";
import { TodoColor, Type } from "./enums";

/**
 * Custom interface extending vscode.TreeItem to include additional properties.
 */
export interface CustomTreeItem extends vscode.TreeItem {
    description?: string;
    text?: string;
    folders?: Folder[];
    todos?: Todo[];
    folderPath?: string[];
    filePath?: string;
    lineNumber?: number;
}

/**
 * Interface representing a Folder.
 */
export interface Folder {
    type: Type.FOLDER;
    id: string;
    label: string;
    folders: Folder[];
    todos: Todo[];
}

/**
 * Creates a new Folder object.
 *
 * @param label - The label of the folder.
 * @param folders - The subfolders contained within this folder.
 * @param todos - The todos contained within this folder.
 *
 * @returns A new Folder object.
 */
export function createFolderObject(label: string, folders: Folder[] = [], todos: Todo[] = []): Folder {
    return {
        type: Type.FOLDER,
        id: getNonce(),
        label,
        folders,
        todos,
    };
}

/**
 * Interface representing a Todo.
 */
export interface Todo {
    type: Type.TODO;
    id: string;
    text: string;
    date: string;
    color: TodoColor;
    folderPath: string[];
    addedToCommitMessage: boolean;
    fileName?: string;
    filePath?: string;
    lineNumber?: number;
}

/**
 * Creates a new Todo object.
 *
 * @param text - The text of the todo.
 * @param color - The color of the todo. Default is "blue".
 * @param folderPath - The folder path where the todo is located. Default is an empty array.
 * @param fileName - The name of the file where the todo is located.
 * @param filePath - The path of the file where the todo is located.
 * @param lineNumber - The line number in the file where the todo is located.
 *
 * @returns A new Todo object.
 */
export function createTodoObject(
    text: string,
    color: TodoColor = TodoColor.BLUE,
    folderPath: string[] = [],
    fileName?: string,
    filePath?: string,
    lineNumber?: number
): Todo {
    return {
        type: Type.TODO,
        id: getNonce(),
        text,
        date: new Date().toString(),
        color,
        folderPath: folderPath,
        addedToCommitMessage: false,
        fileName,
        filePath,
        lineNumber,
    };
}
