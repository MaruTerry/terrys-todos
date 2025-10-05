import * as vscode from "vscode";
import {
    getTodos,
    updateTodosInWorkspace,
    getDoneTodos,
    updateDoneTodosInWorkspace,
    getSortingMode,
} from "../settings/workspaceProperties";
import { getFolderById, getParentFolderById } from "./folder";
import { Todo, Folder, CustomTreeItem, createTodoObject } from "../interfaces/interfaces";
import { SortingMode, TodoColor, Type } from "../interfaces/enums";
import { sortTodosByDate, sortTodosByColor, sortData } from "../util/sorting";

/**
 * Gets a todo defined by the given id from the given data.
 *
 * @param id - The id of the todo to find.
 * @param data - The data to find the todo in.
 * @returns A promise that resolves into the needed todo or undefined if no matching id was found.
 */
export function getTodoById(id: string, data: (Todo | Folder)[]): Todo | undefined {
    for (const item of data) {
        if (item.type === Type.TODO && item.id === id) {
            return item as Todo;
        }
        if (item.type === Type.FOLDER) {
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
        if (item.type === Type.TODO) {
            item.folderPath = currentFolderPath;
        } else if (item.type === Type.FOLDER) {
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
    const text = await vscode.window.showInputBox({ prompt: "Enter the todo" });
    if (!text) {
        return;
    }
    const data: (Todo | Folder)[] = await getTodos();
    const newTodo = createTodoObject(text);
    if (treeItem !== undefined && treeItem.id && treeItem.contextValue === "folder") {
        newTodo.folderPath = treeItem.folderPath
            ? treeItem.folderPath.concat(treeItem.label?.toString() ?? "")
            : [treeItem.label?.toString() ?? ""];
        const folder = await getFolderById(treeItem.id, data);
        if (folder) {
            folder.todos.push(newTodo);
        }
    } else {
        data.push(newTodo);
    }
    await sortData(data);
    await updateTodosInWorkspace(data);
}

/**
 * Edits a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be edited.
 */
export async function editTodo(treeItem: CustomTreeItem) {
    let data: (Todo | Folder)[] = await getTodos();
    let newText = await vscode.window.showInputBox({ value: treeItem.label?.toString(), prompt: "Edit the todo" });
    if (data && newText && treeItem.id) {
        let todoToEdit = getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            todoToEdit.text = newText;
            await updateTodosInWorkspace(data);
        }
    }
}

/**
 * Edits a done todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to be edited.
 */
export async function editDoneTodo(treeItem: CustomTreeItem) {
    let doneTodos: Todo[] = await getDoneTodos();
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
        if (item.type === Type.TODO && item.id === id) {
            data.splice(i, 1);
        } else if (item.type === Type.FOLDER) {
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
        if (item.type === Type.TODO && item.id === id) {
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
    await updateTodosInWorkspace([]);
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
    let data: (Todo | Folder)[] = await getTodos();
    let doneTodos: Todo[] = await getDoneTodos();
    if (treeItem.id) {
        let todoToEdit = getTodoById(treeItem.id, data);
        if (todoToEdit !== undefined) {
            deleteTodoById(treeItem.id, data);
            await updateTodosInWorkspace(data);
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
    let data: (Todo | Folder)[] = await getTodos();
    let doneTodos: Todo[] = await getDoneTodos();
    if (data && doneTodos && treeItem.id) {
        let todoToEdit = getTodoById(treeItem.id, doneTodos);
        if (todoToEdit !== undefined) {
            deleteDoneTodoById(treeItem.id, doneTodos);
            await updateDoneTodosInWorkspace(doneTodos);
            todoToEdit.addedToCommitMessage = false;
            data.push(todoToEdit);
            await updateTodosInWorkspace(data);
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
    let data: (Todo | Folder)[] = await getTodos();
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
                if (sortingMode === SortingMode.DATE) {
                    await sortTodosByDate(data);
                } else if (sortingMode === SortingMode.COLOR) {
                    await sortTodosByColor(data);
                }
                await updateTodosInWorkspace(data);
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
            if (sortingMode === SortingMode.DATE) {
                await sortTodosByDate(data);
            } else if (sortingMode === SortingMode.COLOR) {
                await sortTodosByColor(data);
            }
            await updateTodosInWorkspace(data);
        }
    }
}

/**
 * Sets the color of a todo.
 *
 * @param treeItem - The CustomTreeItem representing the todo to update.
 * @param color - The new color.
 */
export async function setTodoColor(treeItem: CustomTreeItem, color: TodoColor) {
    let data = await getTodos();
    let doneTodos = await getDoneTodos();
    if (data && doneTodos) {
        if (treeItem.id) {
            let todo = getTodoById(treeItem.id, data);
            if (todo) {
                todo.color = color;
                await updateTodosInWorkspace(data);
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
