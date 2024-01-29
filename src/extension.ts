import * as vscode from "vscode";
import { TodosTreeDataProvider } from "./providers/todosTreeProvider";
import {
    adjustSubPath,
    createTodo,
    deleteAllDoneTodos,
    deleteAllNotDoneTodos,
    deleteTodo,
    editTodo,
    setTodoDone,
    setTodoNotDone,
} from "./models/todo";
import { CustomTreeItem } from "./models/customTreeItem";
import { DoneTodosTreeDataProvider } from "./providers/doneTodosTreeProvider";
import { createFolder, deleteFolder, renameFolder } from "./models/folder";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodo", () => {
            createTodo();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editTodo", (todo: CustomTreeItem) => {
            editTodo(todo);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteTodo", (todo: CustomTreeItem) => {
            deleteTodo(todo);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.adjustSubPath", (todo: CustomTreeItem) => {
            adjustSubPath(todo);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteAllNotDoneTodos", () => {
            deleteAllNotDoneTodos();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteAllDoneTodos", () => {
            deleteAllDoneTodos();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoDone", (todo: CustomTreeItem) => {
            setTodoDone(todo);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoNotDone", (todo: CustomTreeItem) => {
            setTodoNotDone(todo);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.renameFolder", (folder: CustomTreeItem) => {
            renameFolder(folder);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteFolder", (folder: CustomTreeItem) => {
            deleteFolder(folder);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.toggleDates", async () => {
            if ((await vscode.workspace.getConfiguration().get("terrys-todos.showDates")) === true) {
                await vscode.workspace
                    .getConfiguration()
                    .update("terrys-todos.showDates", false, vscode.ConfigurationTarget.Workspace);
            } else {
                await vscode.workspace
                    .getConfiguration()
                    .update("terrys-todos.showDates", true, vscode.ConfigurationTarget.Workspace);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createFolder", () => {
            createFolder();
        })
    );

    const todosTreeDataProvider = new TodosTreeDataProvider();

    context.subscriptions.push(vscode.window.registerTreeDataProvider("todos-tree", todosTreeDataProvider));

    todosTreeDataProvider.onDidChangeTreeData

    const doneTodosTreeDataProvider = new DoneTodosTreeDataProvider();

    context.subscriptions.push(vscode.window.registerTreeDataProvider("done-todos-tree", doneTodosTreeDataProvider));

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.refreshTodos", () => {
            todosTreeDataProvider.refresh(true).then(() => {
                doneTodosTreeDataProvider.refresh(true).then(() => {
                    vscode.window.showInformationMessage("Todos refreshed");
                });
            });
        })
    );
}

export function deactivate() {}
