import * as vscode from "vscode";
import {
    createTodo,
    deleteAllDoneTodos,
    deleteAllNotDoneTodos,
    deleteDoneTodoById,
    deleteTodoById,
    editDoneTodo,
    editTodo,
    setTodoColor,
    setTodoDone,
    setTodoNotDone,
} from "../logic/todo";
import { isWorkspaceOpened } from "../util/workspace";
import {
    getDoneTodos,
    getIgnoredFileLines,
    getIgnoredFilePaths,
    getTodos,
    setIgnoredFileLines,
    setIgnoredFilePaths,
    updateDoneTodosInWorkspace,
    updateTodosInWorkspace,
} from "../settings/workspaceProperties";
import { setFolderDone } from "../logic/folder";
import { CustomTreeItem } from "../interfaces/interfaces";
import { sortData } from "../util/sorting";
import { TodoColor } from "../interfaces/enums";

/**
 * Registers all commands related to todos.
 *
 * @param context - The extension context.
 */
export function registerTodoCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodo", (treeItem?: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            createTodo(treeItem);
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
            await updateTodosInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteDoneTodo", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened() || treeItem.id === undefined) {
                return;
            }
            let data = await getDoneTodos();
            deleteDoneTodoById(treeItem.id, data);
            await updateDoneTodosInWorkspace(data);
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
            await sortData(data);
            await updateTodosInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoRed", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.RED);
            const data = await getTodos();
            await sortData(data);
            await updateTodosInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoGreen", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.GREEN);
            const data = await getTodos();
            await sortData(data);
            await updateTodosInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoBlue", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setTodoColor(treeItem, TodoColor.BLUE);
            const data = await getTodos();
            await sortData(data);
            await updateTodosInWorkspace(data);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.ignoreFile", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            const filePath = treeItem.resourceUri?.path;
            if (!filePath) {
                return;
            }
            const ignoredFiles = await getIgnoredFilePaths();
            if (!ignoredFiles.includes(filePath)) {
                ignoredFiles.push(filePath);
                await setIgnoredFilePaths(ignoredFiles);
                vscode.window.showInformationMessage(`File "${filePath}" has been added to ignored files.`);
                vscode.commands.executeCommand("terrys-todos.refreshTodos");
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.ignoreFileLine", async (treeItem: CustomTreeItem) => {
            if (!isWorkspaceOpened()) {
                return;
            }
            const fileLine = `${treeItem.filePath}/${treeItem.lineNumber}`;
            const ignoredLines = await getIgnoredFileLines();
            if (!ignoredLines.includes(fileLine)) {
                ignoredLines.push(fileLine);
                await setIgnoredFileLines(ignoredLines);
                const fileName = treeItem.filePath?.split("/").pop();
                vscode.window.showInformationMessage(
                    `Line ${treeItem.lineNumber} from ${fileName} has been added to ignored lines.`
                );
                vscode.commands.executeCommand("terrys-todos.refreshTodos");
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.resetIgnoredFiles", async () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await setIgnoredFilePaths([]);
            await setIgnoredFileLines([]);
            vscode.window.showInformationMessage("Ignored files and lines have been reset.");
            vscode.commands.executeCommand("terrys-todos.refreshTodos");
        })
    );
}
