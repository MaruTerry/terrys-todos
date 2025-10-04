import * as vscode from "vscode";
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
import { isWorkspaceOpened } from "../util/workspace";
import { getTodos, getSortingMode, updateDataInWorkspace } from "../settings/workspaceProperties";
import { setFolderDone } from "../logic/folder";
import { sortTodosByColor } from "../util/sortByColor";
import { sortTodosByDate } from "../util/sortByDate";
import { CustomTreeItem } from "../interfaces/interfaces";
import { TodoColor, SortingMode } from "../interfaces/enums";

/**
 * Registers all commands related to todos.
 *
 * @param context - The extension context.
 */
export function registerTodoCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodo", () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            createTodo();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodoInFolder", (treeItem?: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            createTodo(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editTodo", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            editTodo(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editDoneTodo", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            editDoneTodo(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteTodo", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened() || treeItem.id === undefined) {
                return;
            }
            let data = await getTodos();
            deleteTodoById(treeItem.id, data);
            await updateDataInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteAllNotDoneTodos", () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            deleteAllNotDoneTodos();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteAllDoneTodos", () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            deleteAllDoneTodos();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoDone", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            setTodoDone(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoNotDone", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            setTodoNotDone(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setFolderDone", (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            setFolderDone(treeItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoYellow", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.YELLOW);
            const data = await getTodos();
            const sortingMode = await getSortingMode();
            if (sortingMode === SortingMode.DATE) {
                await sortTodosByDate(data);
            } else if (sortingMode === SortingMode.COLOR) {
                await sortTodosByColor(data);
            }
            await updateDataInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoRed", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.RED);
            const data = await getTodos();
            const sortingMode = await getSortingMode();
            if (sortingMode === SortingMode.DATE) {
                await sortTodosByDate(data);
            } else if (sortingMode === SortingMode.COLOR) {
                await sortTodosByColor(data);
            }
            await updateDataInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoGreen", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.GREEN);
            const data = await getTodos();
            const sortingMode = await getSortingMode();
            if (sortingMode === SortingMode.DATE) {
                await sortTodosByDate(data);
            } else if (sortingMode === SortingMode.COLOR) {
                await sortTodosByColor(data);
            }
            await updateDataInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoBlue", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.BLUE);
            const data = await getTodos();
            const sortingMode = await getSortingMode();
            if (sortingMode === SortingMode.DATE) {
                await sortTodosByDate(data);
            } else if (sortingMode === SortingMode.COLOR) {
                await sortTodosByColor(data);
            }
            await updateDataInWorkspace(data);
        })
    );
}
