import * as vscode from "vscode";
import * as path from "path";
import { getDoneTodos, showDates } from "../settings/workspaceProperties";
import { CustomTreeItem, Todo, Folder } from "../interfaces/interfaces";
import { ContextValue, TodoColor, Type } from "../interfaces/enums";
import { formatDate } from "../util/date";
import { isWorkspaceOpened } from "../util/workspace";

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
        await getDoneTodos()
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
        if (!currentTreeItem) {
            if (isWorkspaceOpened() === false) {
                const noWorkspaceItem = new vscode.TreeItem("", vscode.TreeItemCollapsibleState.None) as CustomTreeItem;
                noWorkspaceItem.description = "⚠️ Please open a workspace to use Terry's Todos";
                noWorkspaceItem.contextValue = ContextValue.NOWORKSPACE;
                return Promise.resolve([noWorkspaceItem]);
            }
            if (this.data.length > 0) {
                return Promise.resolve(this.getBaseItems());
            }
            const newItem = new vscode.TreeItem(
                "Nothing done ._.",
                vscode.TreeItemCollapsibleState.None
            ) as CustomTreeItem;
            newItem.contextValue = ContextValue.NODATA;
            return Promise.resolve([newItem]);
        } else {
            return Promise.resolve(this.getFollowUpItems(currentTreeItem));
        }
    }

    /**
     * Gets the base items (todos and base folders) for the root level.
     *
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        this.data.map((object: Todo | Folder) => {
            if (object.type === Type.TODO) {
                const newItem = new vscode.TreeItem(
                    object.text,
                    vscode.TreeItemCollapsibleState.None
                ) as CustomTreeItem;
                newItem.id = object.id;
                newItem.description = this.showDates ? formatDate(object.date) : "";
                newItem.text = object.text;
                if (object.color === TodoColor.BLUE) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "blue-circle.svg"
                    );
                } else if (object.color === TodoColor.YELLOW) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "yellow-circle.svg"
                    );
                } else if (object.color === TodoColor.RED) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "red-circle.svg"
                    );
                } else if (object.color === TodoColor.GREEN) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "green-circle.svg"
                    );
                }
                newItem.contextValue = ContextValue.DONETODO;
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
