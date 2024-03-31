import * as vscode from "vscode";
import {
    CustomTreeItem,
    getAllData,
    getAllDoneTodos,
    updateDataInWorkspace,
    updateDoneTodosInWorkspace,
} from "./customTreeItem";
import { Folder, deleteEmptyFolders, getFolderById, getParentFolderById } from "./folder";
import { getNonce } from "../util/getNonce";

/**
 * Interface representing a Todo, containing the type "Todo", an id string, a text string, a done boolean and a date string.
 */
export interface Todo {
    type: "Todo";
    id: string;
    text: string;
    date: string;
    color: string;
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
export function findTodoInFolder(folder: Folder, id: string): Todo | undefined {
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
 *
 * @param treeItem - The treeItem representing the folder to create the todo in.
 */
export async function createTodo(treeItem?: CustomTreeItem) {
    const data: (Todo | Folder)[] = await getAllData();
    const text = await vscode.window.showInputBox({ prompt: "Enter the todo" });
    if (text && data) {
        const currentDate = new Date();
        const newTodo: Todo = {
            type: "Todo",
            id: getNonce(),
            text: text,
            date: `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`,
            color: "blue",
        };
        if (treeItem !== undefined) {
            if (treeItem.id) {
                const folder = await getFolderById(treeItem.id, data);
                if (folder) {
                    folder.todos.push(newTodo);
                }
            }
        } else {
            data.push(newTodo);
        }
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
 * Deletes a done todo defined by the given id.
 *
 * @param id - The id of the done todo to delete.
 * @returns A promise that resolves when the todo is deleted.
 */
export async function deleteDoneTodoById(id: string): Promise<void> {
    let doneTodos: Todo[] = await getAllDoneTodos();
    for (let i = 0; i < doneTodos.length; i++) {
        const item = doneTodos[i];
        if (item.type === "Todo" && item.id === id) {
            doneTodos.splice(i, 1);
            await updateDoneTodosInWorkspace(doneTodos);
            return;
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
    await updateDataInWorkspace([]);
}

/**
 * Deletes all done todos.
 */
export async function deleteAllDoneTodos(): Promise<void> {
    updateDoneTodosInWorkspace([]);
}

/**
 * Marks a todo as done.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be updated.
 */
export async function setTodoDone(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getAllData();
    let doneTodos: Todo[] = await getAllDoneTodos();
    if (data && doneTodos && treeItem.id) {
        let todoToEdit = await getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            await deleteTodoById(treeItem.id);
            doneTodos.push(todoToEdit);
            await updateDoneTodosInWorkspace(doneTodos);
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
    let doneTodos: Todo[] = await getAllDoneTodos();
    if (data && doneTodos && treeItem.id) {
        let todoToEdit = await getTodoById(treeItem.id, doneTodos);
        if (todoToEdit !== undefined) {
            await deleteDoneTodoById(treeItem.id);
            data.push(todoToEdit);
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Moves a todo to the given folder.
 *
 * @param todoId - The id of the todo to move.
 * @param targetFolderId - The id of the folder to move the todo into.
 */
export async function moveTodoById(todoId: string, targetFolderId?: string) {
    let data: (Todo | Folder)[] = await getAllData();
    const todoToMove = await getTodoById(todoId, data);
    const currentFolder = getParentFolderById(data, todoId);
    if (todoToMove) {
        if (targetFolderId) {
            const targetFolder = await getFolderById(targetFolderId, data);
            if (targetFolder) {
                if (currentFolder) {
                    currentFolder.todos = currentFolder.todos.filter((todo) => todo.id !== todoId);
                } else {
                    data = data.filter((todo) => todo.id !== todoId);
                }
                targetFolder.todos.push(todoToMove);
                await updateDataInWorkspace(data);
            }
        } else {
            if (currentFolder) {
                currentFolder.todos = currentFolder.todos.filter((todo) => todo.id !== todoId);
            } else {
                data = data.filter((todo) => todo.id !== todoId);
            }
            data.push(todoToMove);
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Sets the color of a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to update.
 * @param color - The new color.
 */
export async function setTodoColor(treeItem: CustomTreeItem, color: string) {
    let data = await getAllData();
    let doneTodos = await getAllDoneTodos();
    if (data && doneTodos) {
        if (treeItem.id) {
            let todo = await getTodoById(treeItem.id, data);
            if (todo) {
                todo.color = color;
                await updateDataInWorkspace(data);
                return;
            }
            todo = await getTodoById(treeItem.id, doneTodos);
            if (todo) {
                todo.color = color;
                await updateDoneTodosInWorkspace(doneTodos);
            }
        }
    }
}
