/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { CustomTreeItem } from "./customTreeItem";

/**
 * Interface representing a ScriptLibrary, containing an array of LibraryItem.
 */
export interface Todo {
    text: string;
    done: boolean;
}

export async function readAndParseTodos(): Promise<Todo[]> {
    try {
        // Check if there is an open workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.error("No workspace folder is open.");
            return [];
        }

        // Get the first workspace folder (you may need to adjust this based on your requirements)
        const workspaceFolder = workspaceFolders[0];

        // Construct the path to the .todo file within the workspace folder
        const todoFilePath = vscode.Uri.joinPath(workspaceFolder.uri, ".todo");

        // Read the content of the file
        const buffer = await vscode.workspace.fs.readFile(todoFilePath);
        const fileContent = buffer.toString();

        const todos: Todo[] = [];
        fileContent.split(";").forEach((todoString) => {
            let tmpTodo: Todo = { text: "", done: false };
            tmpTodo.done = todoString.startsWith("-");
            tmpTodo.text = todoString.substring(1);
            todos.push(tmpTodo);
        });
        return todos;
    } catch (error) {
        console.error("Error reading .todo file:", error);
        return [];
    }
}

/**
 * Creates a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be created.
 */
export function createTodo() {
    vscode.window.showInformationMessage("Created Todo.");
}

/**
 * Delete a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be deleted.
 */
export function deleteTodo(treeItem: CustomTreeItem) {
    vscode.window.showInformationMessage("Deleted Todo '" + treeItem.label + "'.");
}

/**
 * Updates a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export function updateTodo(todo: CustomTreeItem) {
    vscode.window.showInformationMessage("Updated Todo '" + todo.label + "'.");
}
