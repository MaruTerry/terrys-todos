import * as vscode from "vscode";
import { DoneTodosDragAndDropController } from "../controllers/doneTodosDragAndDropController";
import { TodosDragAndDropController } from "../controllers/todosDragAndDropController";
import { DoneTodosTreeDataProvider } from "../providers/doneTodosTreeProvider";
import { TodosTreeDataProvider } from "../providers/todosTreeProvider";
import { isWorkspaceOpened } from "../util/workspaceChecker";

/**
 * Registers all tree views.
 *
 * @param context - The extension context.
 */
export function registerTreeViews(context: vscode.ExtensionContext) {
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
}
