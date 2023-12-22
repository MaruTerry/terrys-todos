/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { CustomTreeItem } from "./customTreeItem";

/**
 * Interface representing a Todo, containing a text string, done boolean and assingee string.
 */
export interface Todo {
    text: string;
    done: boolean;
    assignee: string;
}

/**
 * Returns all existing todos.
 *
 * @returns A promise for an array of todos
 */
export async function getAllTodos(): Promise<Todo[]> {
    let todos: Todo[] = [];
    const todosAsArrays: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (todosAsArrays) {
        todosAsArrays.forEach((arrayTodo) => {
            todos.push({
                text: arrayTodo[0],
                done: arrayTodo[1] === "true" ? true : false,
                assignee: arrayTodo[2],
            });
        });
        return todos;
    }
    return todos;
}

/**
 * Returns the index of the first todo that matched the given string.
 *
 * @param todoText - The todo as a string
 * @returns A the index as a number or undefined if no matches were found
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
 * @param todoText - The new todos
 */
export async function updateTodosInWorkspace(newTodos: string[][]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-todos.todos", newTodos, vscode.ConfigurationTarget.Workspace);
}

/**
 * Creates a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be created
 */
export async function createTodo() {
    let text = await vscode.window.showInputBox({ prompt: "Enter the todo" });
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (text && todos) {
        todos.push([text, "false", ""]);
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
    let newText = await vscode.window.showInputBox({ prompt: "Enter the new todo" });
    if (todos && textOfTodoToEdit && newText) {
        let indexOfTodoToEdit = await getIndexOfTodo(textOfTodoToEdit);
        if (indexOfTodoToEdit !== undefined) {
            todos[indexOfTodoToEdit][0] = newText;
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
 * Assignes a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be assigned.
 */
export async function assignTodo(treeItem: CustomTreeItem) {
    let todos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    let textOfTodoToAssign = treeItem.text;
    let assignee = await vscode.window.showInputBox({
        prompt: 'Enter the name of the assignee. Type "none" to unassign the todo',
    });
    if (todos && textOfTodoToAssign && assignee) {
        let indexOfTodoToAssing = await getIndexOfTodo(textOfTodoToAssign);
        if (indexOfTodoToAssing !== undefined) {
            if (assignee === "none") {
                todos[indexOfTodoToAssing][2] = "";
                await updateTodosInWorkspace(todos);
            } else {
                todos[indexOfTodoToAssing][2] = assignee;
                await updateTodosInWorkspace(todos);
            }
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
        prompt: "Are you sure to delete all todos? Please type 'yes' to confirm",
    });
    if (confirmation === "yes") {
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
