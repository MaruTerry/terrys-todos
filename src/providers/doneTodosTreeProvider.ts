import * as vscode from "vscode";
import { CustomTreeItem, createTreeItem } from "../models/customTreeItem";
import { Todo, readAndParseTodos } from "../models/todo";

/**
 * Tree data provider for displaying done todos in the sidebar tree view.
 */
export class DoneTodosTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private todos: Todo[] | undefined = [];

    /**
     * Constructor for the DoneTodosTreeDataProvider.
     * @param secretStorage - VS Code SecretStorage for handling secure data.
     */
    constructor() {
        // Subscribe to changes in the JSON data and trigger a refresh
        vscode.workspace.onDidChangeConfiguration(() => {
            this.refresh();
        });
        this.refresh(true);
    }

    /**
     * Refreshes the tree view with the latest project data.
     * @param hideNotification - Flag to hide the refresh notification.
     */
    refresh(hideNotification?: boolean): void {
        readAndParseTodos()
            .then((todos) => {
                this.todos = todos;
                this._onDidChangeTreeData.fire();
                if (!hideNotification) {
                    vscode.window.showInformationMessage("Todos refreshed.");
                }
            })
            .catch(() => {
                this.todos = undefined;
                this._onDidChangeTreeData.fire();
            });
    }

    /**
     * Gets the tree item representation for the given element.
     * @param currentTreeItem - The current tree item.
     * @returns The tree item representation.
     */
    getTreeItem(currentTreeItem: CustomTreeItem): vscode.TreeItem {
        return currentTreeItem;
    }

    /**
     * Gets the children of the given element or root if no element is provided.
     * @param currentTreeItem - The current tree item.
     * @returns A promise with the array of children tree items.
     */
    getChildren(currentTreeItem?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (this.todos) {
            if (this.todos.length > 0) {
                if (!currentTreeItem) {
                    // Root level, show todos and "done" folder
                    return Promise.resolve(this.getBaseItems());
                } else {
                    // follow up items, show done todos
                    return Promise.resolve(this.getFollowUpItems(currentTreeItem));
                }
            }
            const newItem = createTreeItem("No data available", "", vscode.TreeItemCollapsibleState.None);
            newItem.contextValue = "noData";
            return Promise.resolve([newItem]);
        }
        return Promise.resolve([]);
    }

    /**
     * Gets the base items (todos and base folders) for the root level.
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        if (this.todos) {
            this.todos.map((item: Todo) => {
                if (item.done) {
                    const newItem = createTreeItem(item.text, "", vscode.TreeItemCollapsibleState.None);
                    newItem.contextValue = "doneTodo";
                    treeItems.push(newItem);
                }
            });
        }
        return treeItems;
    }

    /**
     * Gets the follow-up items (subfolders and todos) for a given folder.
     * @param currentTreeItem - The current tree item representing a folder.
     * @returns An array of tree items for the follow-up level.
     */
    private getFollowUpItems(currentTreeItem: CustomTreeItem): CustomTreeItem[] {
        return [];
    }
}
