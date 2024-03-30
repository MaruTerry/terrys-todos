import * as vscode from "vscode";
import { CustomTreeItem, getAllData, updateDataInWorkspace } from "./customTreeItem";
import { Folder, deleteEmptyFolders } from "./folder";
import { getNonce } from "../util/getNonce";

/**
 * Interface representing a Todo, containing the type "Todo", an id string, a text string, a done boolean and a date string.
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
 * Gets a todo defined by the given id from the given data.
 *
 * @param id - The id of the todo to find.
 * @param data - The data to find the todo in.
 * @returns A promise that resolves into the needed todo or undefined if no matching id was found.
 */
export async function getTodoById(id: string, data: (Todo | Folder)[]): Promise<Todo | undefined> {
    for (const item of data) {
        if (item.type === "Todo" && item.id === id) {
            return item as Todo;
        }
        if (item.type === "Folder") {
            const todo = findTodoInFolder(item, id);
            if (todo) {
                return todo;
            }
        }
    }
    return undefined;
}

/**
 * Helper function to recursively search for a todo within a folder.
 *
 * @param folder - The folder to search within.
 * @param id - The id of the todo to find.
 * @returns The todo if found, otherwise undefined.
 */
function findTodoInFolder(folder: Folder, id: string): Todo | undefined {
    for (const todo of folder.todos) {
        if (todo.id === id) {
            return todo;
        }
    }
    // Recursively search within subfolders
    for (const subfolder of folder.folders) {
        const foundTodo = findTodoInFolder(subfolder, id);
        if (foundTodo) {
            return foundTodo;
        }
    }
    return undefined;
}

/**
 * Creates a todo.
 */
export async function createTodo() {
    let data: (Todo | Folder)[] = await getAllData();
    let text = await vscode.window.showInputBox({ prompt: "Enter the todo" });
    if (text && data) {
        const currentDate = new Date();
        const newTodo: Todo = {
            type: "Todo",
            id: getNonce(),
            text: text,
            done: false,
            date: `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`,
        };
        data.push(newTodo);
        await updateDataInWorkspace(data);
    }
}

/**
 * Edits a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be edited.
 */
export async function editTodo(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getAllData();
    let newText = await vscode.window.showInputBox({ value: treeItem.label?.toString(), prompt: "Edit the todo" });
    if (data && newText && treeItem.id) {
        let todoToEdit = await getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            const currentDate = new Date();
            todoToEdit.text = newText;
            todoToEdit.date = `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`;
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Deletes a todo defined by the given id.
 *
 * @param id - The id of the todo to delete.
 * @returns A promise that resolves when the todo is deleted.
 */
export async function deleteTodoById(id: string): Promise<void> {
    let data: (Todo | Folder)[] = await getAllData();
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === "Todo" && item.id === id) {
            data.splice(i, 1);
            await updateDataInWorkspace(data);
            return;
        }
        if (item.type === "Folder") {
            if (removeTodoFromFolder(item, id)) {
                await updateDataInWorkspace(data);
                return;
            }
        }
    }
}

/**
 * Helper function to recursively search for and remove a todo within a folder.
 *
 * @param folder - The folder to search within.
 * @param id - The id of the todo to remove.
 * @returns True if the todo was removed, otherwise false.
 */
function removeTodoFromFolder(folder: Folder, id: string): boolean {
    for (let i = 0; i < folder.todos.length; i++) {
        if (folder.todos[i].id === id) {
            // Remove the todo from the folder's todos
            folder.todos.splice(i, 1);
            return true;
        }
    }
    for (const subfolder of folder.folders) {
        if (removeTodoFromFolder(subfolder, id)) {
            return true;
        }
    }
    return false;
}

/**
 * Deletes all not done todos.
 */
export async function deleteAllNotDoneTodos(): Promise<void> {
    let data: (Todo | Folder)[] = await getAllData();
    data = data.filter((item) => {
        if (item.type === "Todo" && !item.done) {
            return false;
        } else if (item.type === "Folder") {
            item.todos = item.todos.filter((todo) => !todo.done);
            return item.todos.length > 0 || item.folders.length > 0;
        }
        return true;
    });
    await updateDataInWorkspace(data);
    deleteEmptyFolders();
}

/**
 * Deletes all done todos.
 */
export async function deleteAllDoneTodos(): Promise<void> {
    let data: (Todo | Folder)[] = await getAllData();
    data = data.filter((item) => {
        if (item.type === "Todo" && item.done) {
            return false;
        } else if (item.type === "Folder") {
            item.todos = item.todos.filter((todo) => !todo.done);
            return item.todos.length > 0 || item.folders.length > 0;
        }
        return true;
    });
    await updateDataInWorkspace(data);
    deleteEmptyFolders();
}

/**
 * Marks a todo as done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export async function setTodoDone(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getAllData();
    if (data && treeItem.id) {
        let todoToEdit = await getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            todoToEdit.done = true;
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Marks a todo as not done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export async function setTodoNotDone(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getAllData();
    if (data && treeItem.id) {
        let todoToEdit = await getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            todoToEdit.done = false;
            await updateDataInWorkspace(data);
        }
    }
}
