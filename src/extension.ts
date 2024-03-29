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
import { isWorkspaceOpened } from "./util/workspaceChecker";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodo", () => {
            if (isWorkspaceOpened()) {
                createTodo();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.editTodo", (todo: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                editTodo(todo);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.deleteTodo", (todo: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                deleteTodo(todo);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.adjustSubPath", (todo: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                adjustSubPath(todo);
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
        vscode.commands.registerCommand("terrys-todos.setTodoDone", (todo: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoDone(todo);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoNotDone", (todo: CustomTreeItem) => {
            if (isWorkspaceOpened()) {
                setTodoNotDone(todo);
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

    context.subscriptions.push(vscode.window.registerTreeDataProvider("todos-tree", todosTreeDataProvider));

    todosTreeDataProvider.onDidChangeTreeData;

    const doneTodosTreeDataProvider = new DoneTodosTreeDataProvider();

    context.subscriptions.push(vscode.window.registerTreeDataProvider("done-todos-tree", doneTodosTreeDataProvider));

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
}

export function deactivate() {}
