import * as vscode from "vscode";
import { getNonce } from "../util/getNonce";
import { sortTodosByDate } from "../util/sortByDate";
import {
    getAllData,
    updateDataInWorkspace,
    getAllDoneTodos,
    updateDoneTodosInWorkspace,
    getSortingMode,
} from "../settings/workspaceProperties";
import { sortTodosByColor } from "../util/sortByColor";
import { CustomTreeItem } from "../interfaces/customTreeItem";
import { Folder } from "../interfaces/folder";
import { Todo } from "../interfaces/todo";
import { getFolderById, getParentFolderById } from "./folder";

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
export function getTodoById(id: string, data: (Todo | Folder)[]): Todo | undefined {
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
 * Updates the folderPath of all todos under the given data.
 *
 * @param data - The array of todos and folders.
 * @param currentFolderPath - The current folder path.
 */
export async function updateTodoFolderPaths(data: (Todo | Folder)[], currentFolderPath: string[]) {
    for (const item of data) {
        if (item.type === "Todo") {
            item.folderPath = currentFolderPath;
        } else if (item.type === "Folder") {
            if (item.label) {
                await updateTodoFolderPaths(item.todos, [...currentFolderPath, item.label.toString()]);
                await updateTodoFolderPaths(item.folders, [...currentFolderPath, item.label.toString()]);
            }
        }
    }
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
            folderPath: [],
            addedToCommitMessage: false,
        };
        if (treeItem !== undefined) {
            if (treeItem.id) {
                newTodo.folderPath = treeItem.folderPath
                    ? treeItem.folderPath.concat(treeItem.label?.toString() ?? "")
                    : [treeItem.label?.toString() ?? ""];
                const folder = await getFolderById(treeItem.id, data);
                if (folder) {
                    folder.todos.push(newTodo);
                }
            }
        } else {
            data.push(newTodo);
        }
        const sortingMode = await getSortingMode();
        if (sortingMode === "date") {
            await sortTodosByDate(data);
        } else if (sortingMode === "color") {
            await sortTodosByColor(data);
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
        let todoToEdit = getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            todoToEdit.text = newText;
            await updateDataInWorkspace(data);
        }
    }
}

/**
 * Edits a done todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be edited.
 */
export async function editDoneTodo(treeItem: CustomTreeItem) {
    let doneTodos: Todo[] = await getAllDoneTodos();
    let newText = await vscode.window.showInputBox({ value: treeItem.label?.toString(), prompt: "Edit the todo" });
    if (doneTodos && newText && treeItem.id) {
        let todoToEdit = getTodoById(treeItem.id, doneTodos);
        if (todoToEdit !== undefined) {
            todoToEdit.text = newText;
            await updateDoneTodosInWorkspace(doneTodos);
        }
    }
}

/**
 * Deletes a todo defined by the given id from the given data.
 *
 * @param id - The id of the todo to delete.
 * @returns A promise that resolves when the todo is deleted.
 */
export function deleteTodoById(id: string, data: (Todo | Folder)[]) {
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === "Todo" && item.id === id) {
            data.splice(i, 1);
        } else if (item.type === "Folder") {
            removeTodoFromFolder(item, id);
        }
    }
}

/**
 * Deletes a done todo defined by the given id in the given data.
 *
 * @param id - The id of the done todo to delete.
 * @returns A promise that resolves when the todo is deleted.
 */
export function deleteDoneTodoById(id: string, data: Todo[]) {
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.type === "Todo" && item.id === id) {
            data.splice(i, 1);
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
function removeTodoFromFolder(folder: Folder, id: string) {
    for (let i = 0; i < folder.todos.length; i++) {
        if (folder.todos[i].id === id) {
            // Remove the todo from the folder's todos
            folder.todos.splice(i, 1);
        }
    }
    for (const subfolder of folder.folders) {
        removeTodoFromFolder(subfolder, id);
    }
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
    if (treeItem.id) {
        let todoToEdit = getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            deleteTodoById(treeItem.id, data);
            await updateDataInWorkspace(data);
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
        let todoToEdit = getTodoById(treeItem.id, doneTodos);
        if (todoToEdit !== undefined) {
            deleteDoneTodoById(treeItem.id, doneTodos);
            await updateDoneTodosInWorkspace(doneTodos);
            todoToEdit.addedToCommitMessage = false;
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
    const todoToMove = getTodoById(todoId, data);
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
                await updateTodoFolderPaths(data, []);
                const sortingMode = await getSortingMode();
                if (sortingMode === "date") {
                    await sortTodosByDate(data);
                } else if (sortingMode === "color") {
                    await sortTodosByColor(data);
                }
                await updateDataInWorkspace(data);
            }
        } else {
            if (currentFolder) {
                currentFolder.todos = currentFolder.todos.filter((todo) => todo.id !== todoId);
            } else {
                data = data.filter((todo) => todo.id !== todoId);
            }
            todoToMove.folderPath = [];
            data.push(todoToMove);
            const sortingMode = await getSortingMode();
            if (sortingMode === "date") {
                await sortTodosByDate(data);
            } else if (sortingMode === "color") {
                await sortTodosByColor(data);
            }
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
            let todo = getTodoById(treeItem.id, data);
            if (todo) {
                todo.color = color;
                await updateDataInWorkspace(data);
                return;
            }
            todo = getTodoById(treeItem.id, doneTodos);
            if (todo) {
                todo.color = color;
                await updateDoneTodosInWorkspace(doneTodos);
            }
        }
    }
}
