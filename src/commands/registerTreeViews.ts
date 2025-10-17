import * as vscode from "vscode";
import { TodosDragAndDropController } from "../controllers/todosDragAndDropController";
import { DoneTodosTreeDataProvider } from "../providers/doneTodosTreeProvider";
import { TodosTreeDataProvider } from "../providers/todosTreeProvider";
import { isWorkspaceOpened } from "../util/workspace";

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

    context.subscriptions.push(
        vscode.window.createTreeView("done-todos-tree", {
            treeDataProvider: doneTodosTreeDataProvider,
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.refreshTodos", async () => {
            if (!isWorkspaceOpened()) {
                return;
            }
            await todosTreeDataProvider.refresh();
            await doneTodosTreeDataProvider.refresh();
            vscode.window.showInformationMessage("Todos refreshed");
        })
    );
}
