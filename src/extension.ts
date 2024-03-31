import * as vscode from "vscode";
import { TodosTreeDataProvider } from "./providers/todosTreeProvider";
import {
    createTodo,
    deleteAllDoneTodos,
    deleteAllNotDoneTodos,
    deleteTodoById,
    editTodo,
    setTodoColor,
    setTodoDone,
    setTodoNotDone,
} from "./models/todo";
import { CustomTreeItem } from "./models/customTreeItem";
import { DoneTodosTreeDataProvider } from "./providers/doneTodosTreeProvider";
import { isWorkspaceOpened } from "./util/workspaceChecker";
import { TodosDragAndDropController } from "./controllers/todosDragAndDropController";
import { createBaseFolder, createFolder, deleteFolderById, editFolderLabel, setFolderDone } from "./models/folder";
import { DoneTodosDragAndDropController } from "./controllers/doneTodosDragAndDropController";
import { importOldTodos } from "./util/importOldTodos";
import { getAllData, getSortingMode, setSortingMode, updateDataInWorkspace } from "./settings/workspaceProperties";
import { sortTodosByDate } from "./util/sortByDate";
import { sortTodosByColor } from "./util/sortByColor";

export function activate(context: vscode.ExtensionContext) {
    importOldTodos();

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
        vscode.commands.registerCommand("terrys-todos.deleteTodo", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                if (treeItem.id) deleteTodoById(treeItem.id);
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

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.toggleDates", async () => {
            if (isWorkspaceOpened()) {
                if ((await vscode.workspace.getConfiguration().get("terrys-todos.showDates")) === true) {
                    await vscode.workspace
                        .getConfiguration()
                        .update("terrys-todos.showDates", false, vscode.ConfigurationTarget.Workspace);
                } else {
                    await vscode.workspace
                        .getConfiguration()
                        .update("terrys-todos.showDates", true, vscode.ConfigurationTarget.Workspace);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setSortingModeDate", async () => {
            if (isWorkspaceOpened()) {
                await setSortingMode("date");
                const data = await getAllData();
                await sortTodosByDate(data);
                await updateDataInWorkspace(data);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setSortingModeColor", async () => {
            if (isWorkspaceOpened()) {
                await setSortingMode("color");
                const data = await getAllData();
                await sortTodosByColor(data);
                await updateDataInWorkspace(data);
            }
        })
    );

    const todosTreeDataProvider = new TodosTreeDataProvider();
    const todosDragAndDropController = new TodosDragAndDropController(todosTreeDataProvider);

    context.subscriptions.push(
        vscode.window.createTreeView("todos-tree", {
            treeDataProvider: todosTreeDataProvider,
            showCollapseAll: true,
            dragAndDropController: todosDragAndDropController,
        })
    );

    const doneTodosTreeDataProvider = new DoneTodosTreeDataProvider();
    const doneTodosDragAndDropController = new DoneTodosDragAndDropController();

    context.subscriptions.push(
        vscode.window.createTreeView("done-todos-tree", {
            treeDataProvider: doneTodosTreeDataProvider,
            dragAndDropController: doneTodosDragAndDropController,
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.refreshTodos", () => {
            if (isWorkspaceOpened()) {
                todosTreeDataProvider.refresh(true).then(() => {
                    doneTodosTreeDataProvider.refresh(true).then(() => {
                        vscode.window.showInformationMessage("Todos refreshed");
                    });
                });
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createBaseFolder", () => {
            if (isWorkspaceOpened()) {
                createBaseFolder();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createFolder", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                createFolder(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editFolderLabel", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                editFolderLabel(treeItem);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteFolder", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                if (treeItem.id) deleteFolderById(treeItem.id);
            }
        })
    );
}

export function deactivate() {}
