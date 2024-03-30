import * as vscode from "vscode";
import { CustomTreeItem } from "../models/customTreeItem";
import { Todo, getAllTodos, showDates } from "../models/todo";
import * as path from "path";
import { Folder, getAllFolders } from "../models/folder";

/**
 * Tree data provider for displaying todos in the sidebar tree view.
 */
export class TodosTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private todos: Todo[] | undefined = [];
    private folders: Folder[] | undefined = [];
    private createdItems: string[] = [];
    private showDates: boolean = false;

    /**
     * Constructor for the TodosTreeDataProvider.
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
        this.todos = [];
        this.createdItems.length = 0;
        this.showDates = await showDates();
        await getAllTodos()
            .then((todos) => {
                todos.forEach((todo) => {
                    if (!todo.done) {
                        this.todos?.push(todo);
                    }
                });
            })
            .catch(() => {
                this.todos = undefined;
            });
        await getAllFolders()
            .then((folders) => {
                this.folders = folders;
            })
            .catch(() => {
                this.folders = undefined;
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
        if (this.todos) {
            if (this.todos.length > 0) {
                if (!currentTreeItem) {
                    return Promise.resolve(this.getBaseItems());
                } else {
                    return Promise.resolve(this.getFollowUpItems(currentTreeItem));
                }
            }
            const newItem = new vscode.TreeItem(
                "Nothing to do :)",
                vscode.TreeItemCollapsibleState.None
            ) as CustomTreeItem;
            newItem.contextValue = "noData";
            return Promise.resolve([newItem]);
        }
        return Promise.resolve([]);
    }

    /**
     * Gets the base items (todos and base folders) for the root level.
     *
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        if (this.folders) {
            // create base folders
            this.folders.map((folder: Folder) => {
                if (folder.superiorFolderLabel === "") {
                    const newItem = new vscode.TreeItem(
                        folder.label,
                        vscode.TreeItemCollapsibleState.Collapsed
                    ) as CustomTreeItem;
                    newItem.superiorFolderLabel = "";
                    newItem.contextValue = "folder";
                    this.createdItems.push(folder.label);
                    treeItems.push(newItem);
                }
            });
        }
        if (this.todos) {
            // create base todos
            this.todos.map((item: Todo) => {
                if (item.superiorFolderLabel === "") {
                    if (!this.showDates) {
                        item.date = "";
                    }
                    const newItem = new vscode.TreeItem(
                        item.text,
                        vscode.TreeItemCollapsibleState.None
                    ) as CustomTreeItem;
                    newItem.description = item.date;
                    newItem.text = item.text;
                    newItem.done = item.done;
                    newItem.superiorFolderLabel = "";
                    newItem.description = item.date;
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "circle.svg");
                    newItem.contextValue = "todo";
                    this.createdItems.push(item.text);
                    treeItems.push(newItem);
                }
            });
        }
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
        if (this.folders) {
            this.folders.map((folder: Folder) => {
                if (currentTreeItem.label !== undefined && currentTreeItem.superiorFolderLabel !== undefined) {
                    if (folder.superiorFolderLabel === currentTreeItem.label.toString()) {
                        const newFolder = new vscode.TreeItem(
                            folder.label,
                            vscode.TreeItemCollapsibleState.Collapsed
                        ) as CustomTreeItem;
                        newFolder.superiorFolderLabel = folder.superiorFolderLabel;
                        newFolder.contextValue = "folder";
                        this.createdItems.push(folder.label);
                        treeItems.push(newFolder);
                    }
                }
            });
        }
        if (this.todos) {
            this.todos.map((todo: Todo) => {
                if (currentTreeItem.label !== undefined && currentTreeItem.superiorFolderLabel !== undefined) {
                    if (todo.superiorFolderLabel === currentTreeItem.label.toString()) {
                        if (!this.showDates) {
                            todo.date = "";
                        }
                        const newItem = new vscode.TreeItem(
                            todo.text,
                            vscode.TreeItemCollapsibleState.None
                        ) as CustomTreeItem;
                        newItem.description = todo.date;
                        newItem.text = todo.text;
                        newItem.done = todo.done;
                        newItem.superiorFolderLabel = todo.superiorFolderLabel;
                        newItem.description = todo.date;
                        newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "circle.svg");
                        newItem.contextValue = "todo";
                        this.createdItems.push(todo.text);
                        treeItems.push(newItem);
                    }
                }
            });
        }
        return treeItems;
    }
}
