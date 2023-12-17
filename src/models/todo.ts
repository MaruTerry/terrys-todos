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

/**
 * Returns all existing todos.
 * @returns A promise for an array of todos
 */
export async function getAllTodos(): Promise<Todo[]> {
    let todos: Todo[] = [];
    const todosAsArrays: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (todosAsArrays) {
        todosAsArrays.forEach((arrayTodo) => {
            todos.push({
                text: arrayTodo[0],
                done: arrayTodo[1] === "true" ? true : false,
            });
        });
        return todos;
    }
    return todos;
}

/**
 * Creates a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be created.
 */
export async function createTodo() {
    let text = await vscode.window.showInputBox({ prompt: "Enter the todo" });
    if (text) {
        let todos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
        if (todos) {
            todos.push([text, "false"]);
            vscode.workspace
                .getConfiguration()
                .update("terrys-todos.todos", todos, vscode.ConfigurationTarget.Workspace);
        }
    }
}

/**
 * Edits a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be edited.
 */
export async function editTodo(treeItem: CustomTreeItem) {
    let textOfTodoToEdit = treeItem.text;
    if (textOfTodoToEdit) {
        let todos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
        if (todos) {
            todos.forEach(async (arrayTodo) => {
                if (arrayTodo[0] === textOfTodoToEdit) {
                    let newText = await vscode.window.showInputBox({ prompt: "Enter the new todo" });
                    if (newText) {
                        arrayTodo[0] = newText;
                        vscode.workspace
                            .getConfiguration()
                            .update("terrys-todos.todos", todos, vscode.ConfigurationTarget.Workspace);
                    }
                }
            });
        }
    }
}

/**
 * Deletes a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be deleted.
 */
export function deleteTodo(treeItem: CustomTreeItem) {
    let textOfTodoToDelete = treeItem.text;
    if (textOfTodoToDelete) {
        let currentTodos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
        let newTodos: string[][] = [];
        if (currentTodos) {
            currentTodos.forEach((arrayTodo) => {
                if (arrayTodo[0] !== textOfTodoToDelete) {
                    newTodos.push(arrayTodo);
                }
            });
            vscode.workspace
                .getConfiguration()
                .update("terrys-todos.todos", newTodos, vscode.ConfigurationTarget.Workspace);
        }
    }
}

/**
 * Deletes all todos.
 */
export async function deleteAllTodos() {
    let confirmation = await vscode.window.showInputBox({
        prompt: "Are you sure to delete all todos? Please type 'yes' to confirm",
    });
    if (confirmation === "yes") {
        let currentTodos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
        let newTodos: string[][] = [];
        if (currentTodos) {
            currentTodos.forEach((arrayTodo) => {
                if (arrayTodo[1] === "true") {
                    newTodos.push(arrayTodo);
                }
            });
            vscode.workspace
                .getConfiguration()
                .update("terrys-todos.todos", newTodos, vscode.ConfigurationTarget.Workspace);
        }
    } else {
        vscode.window.showInformationMessage("Process canceled");
    }
}

/**
 * Deletes all done todos.
 */
export async function deleteAllDoneTodos() {
    let currentTodos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let newTodos: string[][] = [];
    if (currentTodos) {
        currentTodos.forEach((arrayTodo) => {
            if (arrayTodo[1] === "false") {
                newTodos.push(arrayTodo);
            }
        });
        vscode.workspace
            .getConfiguration()
            .update("terrys-todos.todos", newTodos, vscode.ConfigurationTarget.Workspace);
    }
}

/**
 * Marks a todo as done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export function setTodoDone(treeItem: CustomTreeItem) {
    let textOfTodoToUpdate = treeItem.text;
    if (textOfTodoToUpdate) {
        let todos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
        if (todos) {
            todos.forEach((arrayTodo) => {
                if (arrayTodo[0] === textOfTodoToUpdate) {
                    arrayTodo[1] = "true";
                }
            });
            vscode.workspace
                .getConfiguration()
                .update("terrys-todos.todos", todos, vscode.ConfigurationTarget.Workspace);
        }
    }
}

/**
 * Marks a todo as not done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export function setTodoNotDone(treeItem: CustomTreeItem) {
    let textOfTodoToUpdate = treeItem.text;
    if (textOfTodoToUpdate) {
        let todos: string[][] | undefined = vscode.workspace.getConfiguration().get("terrys-todos.todos");
        if (todos) {
            todos.forEach((arrayTodo) => {
                if (arrayTodo[0] === textOfTodoToUpdate) {
                    arrayTodo[1] = "false";
                }
            });
            vscode.workspace
                .getConfiguration()
                .update("terrys-todos.todos", todos, vscode.ConfigurationTarget.Workspace);
        }
    }
}
