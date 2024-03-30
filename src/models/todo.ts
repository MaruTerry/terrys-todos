import * as vscode from "vscode";
import { CustomTreeItem } from "./customTreeItem";

/**
 * Interface representing a Todo, containing a text string, done boolean, date string and a superiorFolderLabel string.
 */
export interface Todo {
    type: "Todo";
    id: string;
    text: string;
    done: boolean;
    date: string;
}

/**
 * Returns true if dates should be shown otherwise false.
 *
 * @returns A boolean for a boolean.
 */
export async function showDates(): Promise<boolean> {
    if ((await vscode.workspace.getConfiguration().get("terrys-todos.showDates")) === true) {
        return true;
    }
    return false;
}

/**
 * Returns all existing todos.
 *
 * @returns A promise for an array of todos.
 */
export async function getAllTodos(): Promise<Todo[]> {
    let todos: Todo[] = [];
    const todosAsArrays: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (todosAsArrays) {
        todosAsArrays.forEach((arrayTodo) => {
            todos.push({
                text: arrayTodo[0],
                done: arrayTodo[1] === "true" ? true : false,
                date: arrayTodo[2],
                superiorFolderLabel: arrayTodo[3],
            });
        });
    }
    return todos;
}

/**
 * Returns the index of the first todo that matched the given string.
 *
 * @param todoText - The todo as a string.
 * @returns A the index as a number or undefined if no matches were found.
 */
export async function getIndexOfTodo(todoText: string): Promise<number | undefined> {
    let index = undefined;
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (todos) {
        todos.forEach((arrayTodo) => {
            if (arrayTodo[0] === todoText) {
                index = todos?.indexOf(arrayTodo);
            }
        });
    }
    return index;
}

/**
 * Updates all todos in the workspace.
 *
 * @param newTodos - The new todos.
 */
export async function updateTodosInWorkspace(newTodos: string[][]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-todos.todos", newTodos, vscode.ConfigurationTarget.Workspace);
}

/**
 * Creates a todo.
 */
export async function createTodo() {
    let text = await vscode.window.showInputBox({ prompt: "Enter the todo" });
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (text && todos) {
        const currentDate = new Date();
        todos.push([
            text,
            "false",
            `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`,
            "",
        ]);
        await updateTodosInWorkspace(todos);
    }
}

/**
 * Edits a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be edited.
 */
export async function editTodo(treeItem: CustomTreeItem) {
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let textOfTodoToEdit = treeItem.text;
    let newText = await vscode.window.showInputBox({ value: treeItem.label?.toString(), prompt: "Edit the todo" });
    if (todos && textOfTodoToEdit && newText) {
        let indexOfTodoToEdit = await getIndexOfTodo(textOfTodoToEdit);
        if (indexOfTodoToEdit !== undefined) {
            const currentDate = new Date();
            todos[indexOfTodoToEdit][0] = newText;
            todos[indexOfTodoToEdit][2] = `${currentDate.getDate()}.${
                currentDate.getMonth() + 1
            }.${currentDate.getFullYear()}`;
            await updateTodosInWorkspace(todos);
        }
    }
}

/**
 * Deletes a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be deleted.
 */
export async function deleteTodo(treeItem: CustomTreeItem) {
    let textOfTodoToDelete = treeItem.text;
    let currentTodos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (textOfTodoToDelete && currentTodos) {
        let newTodos: string[][] = [];
        currentTodos.forEach((arrayTodo) => {
            if (arrayTodo[0] !== textOfTodoToDelete) {
                newTodos.push(arrayTodo);
            }
        });
        await updateTodosInWorkspace(newTodos);
    }
}

/**
 * Adjusts the folder label which contains the todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be adjusted.
 * @param superiorFolderLabel - The label of the folder containing the todo. If undefined there will be an input box.
 */
export async function adjustSuperiorFolderLabel(treeItem: CustomTreeItem, superiorFolderLabel?: string) {
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let textOfTodoToEdit = treeItem.text;
    if (superiorFolderLabel === undefined) {
        superiorFolderLabel = await vscode.window.showInputBox({
            value: treeItem.superiorFolderLabel,
            prompt: "Adjust the folder. Enter 'none' to clear the folder label",
        });
        if (superiorFolderLabel === "none") {
            superiorFolderLabel = "";
        }
    }
    if (todos !== undefined && textOfTodoToEdit !== undefined && superiorFolderLabel !== undefined) {
        let indexOfTodoToEdit = await getIndexOfTodo(textOfTodoToEdit);
        if (indexOfTodoToEdit !== undefined) {
            todos[indexOfTodoToEdit][3] = superiorFolderLabel;
            await updateTodosInWorkspace(todos);
            return;
        } else {
            vscode.window.showErrorMessage("Could not find related todo. Try refreshing your todos");
        }
    }
}

/**
 * Deletes all not done todos.
 */
export async function deleteAllNotDoneTodos() {
    let currentTodos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let newTodos: string[][] = [];
    let confirmation = await vscode.window.showInputBox({
        prompt: "Are you sure to delete all todos? Please type 'DELETE' to confirm",
    });
    if (confirmation === "DELETE") {
        if (currentTodos) {
            currentTodos.forEach((arrayTodo) => {
                if (arrayTodo[1] === "true") {
                    newTodos.push(arrayTodo);
                }
            });
            await updateTodosInWorkspace(newTodos);
        }
    } else {
        vscode.window.showInformationMessage("Process canceled");
    }
}

/**
 * Deletes all done todos.
 */
export async function deleteAllDoneTodos() {
    let currentTodos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let newTodos: string[][] = [];
    if (currentTodos) {
        currentTodos.forEach((arrayTodo) => {
            if (arrayTodo[1] === "false") {
                newTodos.push(arrayTodo);
            }
        });
        await updateTodosInWorkspace(newTodos);
    }
}

/**
 * Marks a todo as done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export async function setTodoDone(treeItem: CustomTreeItem) {
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let textOfTodoToUpdate = treeItem.text;
    if (todos && textOfTodoToUpdate) {
        let indexOfTodoToUpdate = await getIndexOfTodo(textOfTodoToUpdate);
        if (indexOfTodoToUpdate !== undefined) {
            todos[indexOfTodoToUpdate][1] = "true";
        }
        await updateTodosInWorkspace(todos);
    }
}

/**
 * Marks a todo as not done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export async function setTodoNotDone(treeItem: CustomTreeItem) {
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let textOfTodoToUpdate = treeItem.text;
    if (todos && textOfTodoToUpdate) {
        let indexOfTodoToUpdate = await getIndexOfTodo(textOfTodoToUpdate);
        if (indexOfTodoToUpdate !== undefined) {
            todos[indexOfTodoToUpdate][1] = "false";
        }
        await updateTodosInWorkspace(todos);
    }
}
