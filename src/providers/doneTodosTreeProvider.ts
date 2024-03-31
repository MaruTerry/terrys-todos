import * as vscode from "vscode";
import { CustomTreeItem, getAllData, getAllDoneTodos } from "../models/customTreeItem";
import { Todo, showDates } from "../models/todo";
import * as path from "path";
import { Folder } from "../models/folder";

/**
 * Tree data provider for displaying done todos in the sidebar tree view.
 */
export class DoneTodosTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private data: Todo[] = [];
    private showDates: boolean = false;

    /**
     * Constructor for the DoneTodosTreeDataProvider.
     *
     * @param secretStorage - VS Code SecretStorage for handling secure data.
     */
    constructor() {
        // Subscribe to changes in the JSON data and trigger a refresh
        vscode.workspace.onDidChangeConfiguration(() => {
            this.refresh(true);
        });
        this.refresh(true);
    }

    /**
     * Refreshes the tree view with the latest project data.
     *
     * @param hideNotification - Flag to hide the refresh notification.
     */
    async refresh(hideNotification?: boolean): Promise<void> {
        this.data = [];
        this.showDates = await showDates();
        await getAllDoneTodos()
            .then((data) => {
                this.data = data;
            })
            .catch(() => {
                this.data = [];
            });
        if (!hideNotification) {
            vscode.window.showInformationMessage("Todos refreshed");
        }
        this._onDidChangeTreeData.fire();
    }

    /**
     * Gets the tree item representation for the given element.
     *
     * @param currentTreeItem - The current tree item.
     * @returns The tree item representation.
     */
    getTreeItem(currentTreeItem: CustomTreeItem): vscode.TreeItem {
        return currentTreeItem;
    }

    /**
     * Gets the children of the given element or root if no element is provided.
     *
     * @param currentTreeItem - The current tree item.
     * @returns A promise with the array of children tree items.
     */
    getChildren(currentTreeItem?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (this.data.length > 0) {
            if (!currentTreeItem) {
                return Promise.resolve(this.getBaseItems());
            } else {
                return Promise.resolve(this.getFollowUpItems(currentTreeItem));
            }
        }
        const newItem = new vscode.TreeItem("Nothing to do :)", vscode.TreeItemCollapsibleState.None) as CustomTreeItem;
        newItem.contextValue = "noData";
        return Promise.resolve([newItem]);
    }

    /**
     * Gets the base items (todos and base folders) for the root level.
     *
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        this.data.map((object: Todo | Folder) => {
            if (object.type === "Todo") {
                if (!this.showDates) {
                    object.date = "";
                }
                const newItem = new vscode.TreeItem(
                    object.text,
                    vscode.TreeItemCollapsibleState.None
                ) as CustomTreeItem;
                newItem.id = object.id;
                newItem.description = object.date;
                newItem.text = object.text;
                if (object.color === "blue") {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "blue-circle.svg");
                } else if (object.color === "yellow") {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "yellow-circle.svg");
                } else if (object.color === "red") {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "red-circle.svg");
                } else if (object.color === "green") {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "green-circle.svg");
                }
                newItem.contextValue = "doneTodo";
                treeItems.push(newItem);
            }
        });
        return treeItems;
    }

    /**
     * Gets the follow-up items (subfolders and todos) for a given folder.
     *
     * @param currentTreeItem - The current tree item representing a folder.
     * @returns An array of tree items for the follow-up level.
     */
    private getFollowUpItems(currentTreeItem: CustomTreeItem): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        return treeItems;
    }
}
