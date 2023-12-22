import * as vscode from "vscode";
import { TodosTreeDataProvider } from "./providers/todosTreeProvider";
import {
    assignTodo,
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
        vscode.commands.registerCommand("terrys-todos.assignTodo", (todo: CustomTreeItem) => {
            assignTodo(todo);
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
