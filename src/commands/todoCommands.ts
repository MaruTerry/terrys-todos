import * as vscode from "vscode";
import { CustomTreeItem } from "../interfaces/customTreeItem";
import {
    createTodo,
    deleteAllDoneTodos,
    deleteAllNotDoneTodos,
    deleteTodoById,
    editDoneTodo,
    editTodo,
    setTodoColor,
    setTodoDone,
    setTodoNotDone,
} from "../logic/todo";
import { isWorkspaceOpened } from "../util/workspaceChecker";
import { getAllData, getSortingMode, updateDataInWorkspace } from "../settings/workspaceProperties";
import { setFolderDone } from "../logic/folder";
import { sortTodosByColor } from "../util/sortByColor";
import { sortTodosByDate } from "../util/sortByDate";

/**
 * Registers all commands related to todos.
 *
 * @param context - The extension context.
 */
export function registerTodoCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodo", () => {
            if (isWorkspaceOpened()) {
                createTodo();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodoInFolder", (treeItem?: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                createTodo(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editTodo", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                editTodo(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editDoneTodo", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                editDoneTodo(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteTodo", async (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                if (treeItem.id) {
                    let data = await getAllData();
                    deleteTodoById(treeItem.id, data);
                    await updateDataInWorkspace(data);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteAllNotDoneTodos", () => {
            if (isWorkspaceOpened()) {
                deleteAllNotDoneTodos();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteAllDoneTodos", () => {
            if (isWorkspaceOpened()) {
                deleteAllDoneTodos();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoDone", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoDone(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoNotDone", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoNotDone(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setFolderDone", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setFolderDone(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoYellow", async (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                await setTodoColor(treeItem, "yellow");
                const data = await getAllData();
                const sortingMode = await getSortingMode();
                if (sortingMode === "date") {
                    await sortTodosByDate(data);
                } else if (sortingMode === "color") {
                    await sortTodosByColor(data);
                }
                await updateDataInWorkspace(data);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoRed", async (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                await setTodoColor(treeItem, "red");
                const data = await getAllData();
                const sortingMode = await getSortingMode();
                if (sortingMode === "date") {
                    await sortTodosByDate(data);
                } else if (sortingMode === "color") {
                    await sortTodosByColor(data);
                }
                await updateDataInWorkspace(data);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoGreen", async (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                await setTodoColor(treeItem, "green");
                const data = await getAllData();
                const sortingMode = await getSortingMode();
                if (sortingMode === "date") {
                    await sortTodosByDate(data);
                } else if (sortingMode === "color") {
                    await sortTodosByColor(data);
                }
                await updateDataInWorkspace(data);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoBlue", async (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                await setTodoColor(treeItem, "blue");
                const data = await getAllData();
                const sortingMode = await getSortingMode();
                if (sortingMode === "date") {
                    await sortTodosByDate(data);
                } else if (sortingMode === "color") {
                    await sortTodosByColor(data);
                }
                await updateDataInWorkspace(data);
            }
        })
    );
}
