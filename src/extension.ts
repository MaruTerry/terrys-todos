import * as vscode from "vscode";
import { CreateTodoWebviewProvider } from "./providers/createTodoWebviewProvider";
import { ShowTodosWebviewProvider } from "./providers/showTodosWebviewProvider";
import { TodosTreeDataProvider } from "./providers/todosTreeProvider";
import { createTodo, updateTodo } from "./models/todo";
import { CustomTreeItem } from "./models/customTreeItem";
import { DoneTodosTreeDataProvider } from "./providers/doneTodosTreeProvider";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ShowTodosWebviewProvider.viewType,
            new ShowTodosWebviewProvider(context.extensionUri)
        )
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CreateTodoWebviewProvider.viewType,
            new CreateTodoWebviewProvider(context.extensionUri)
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.createTodo", () => {
            createTodo();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.setTodoDone", (todo: CustomTreeItem) => {
            updateTodo(todo);
        })
    );

    const todosTreeDataProvider = new TodosTreeDataProvider();

    context.subscriptions.push(vscode.window.registerTreeDataProvider("todos-tree", todosTreeDataProvider));

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.refreshTodos", () => {
            todosTreeDataProvider.refresh();
        })
    );

    const doneTodosTreeDataProvider = new DoneTodosTreeDataProvider();

    context.subscriptions.push(vscode.window.registerTreeDataProvider("done-todos-tree", doneTodosTreeDataProvider));

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.refreshDoneTodos", () => {
            doneTodosTreeDataProvider.refresh();
        })
    );
}

export function deactivate() {}
