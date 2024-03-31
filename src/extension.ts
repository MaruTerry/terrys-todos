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

export function activate(context: vscode.ExtensionContext) {
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
        vscode.commands.registerCommand("terrys-todos.setTodoYellow", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoColor(treeItem, "yellow");
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoRed", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoColor(treeItem, "red");
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoGreen", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoColor(treeItem, "green");
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoBlue", (treeItem: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoColor(treeItem, "blue");
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
