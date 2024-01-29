import * as vscode from "vscode";
import { CustomTreeItem, createTreeItem } from "../models/customTreeItem";
import { Todo, getAllTodos, showDates } from "../models/todo";
import { Folder, getAllFolders } from "../models/folder";

/**
 * Tree data provider for displaying done todos in the sidebar tree view.
 */
export class DoneTodosTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private todos: Todo[] | undefined = [];
    private foldersToCreate: Folder[] | undefined = [];
    private createdFolders: string[] = [];
    private showDates: boolean = false;

    /**
     * Constructor for the DoneTodosTreeDataProvider.
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
     * @param hideNotification - Flag to hide the refresh notification.
     */
    async refresh(hideNotification?: boolean): Promise<void> {
        this.todos = [];
        this.foldersToCreate = [];
        this.createdFolders.length = 0;
        this.showDates = await showDates();
        await getAllFolders()
            .then((folders) => {
                folders.forEach((folder) => {
                    this.foldersToCreate?.push(folder);
                });
            })
            .catch(() => {
                this.foldersToCreate = undefined;
            });
        await getAllTodos()
            .then((todos) => {
                todos.forEach((todo) => {
                    if (todo.done) {
                        this.todos?.push(todo);
                    }
                });
            })
            .catch(() => {
                this.todos = undefined;
            });
        if (!hideNotification) {
            vscode.window.showInformationMessage("Todos refreshed");
        }
        this._onDidChangeTreeData.fire();
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
        if (this.todos && this.foldersToCreate) {
            if (this.todos.length > 0 || this.foldersToCreate.length > 0) {
                if (!currentTreeItem) {
                    // Root level, show todos and "done" folder
                    return Promise.resolve(this.getBaseItems());
                } else {
                    // follow up items, show done todos
                    return Promise.resolve(this.getFollowUpItems(currentTreeItem));
                }
            }
            const newItem = createTreeItem("Nothing done ._.", "", vscode.TreeItemCollapsibleState.None);
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
        if (this.foldersToCreate) {
            this.foldersToCreate.map((item: Folder) => {
                // if it has no subPaths it looks like this. "["/"]"
                if (item.subPath.length === 1) {
                    const newFolder = createTreeItem(item.label, "", vscode.TreeItemCollapsibleState.Collapsed);
                    newFolder.contextValue = "folder";
                    this.createdFolders.push(item.label);
                    treeItems.push(newFolder);
                }
            });
        }
        if (this.todos) {
            this.todos.map((item: Todo) => {
                let baseFolderLabel = item.subPath.split("/")[1];
                // if it has no subPaths it looks like this. "["/"]"
                if (item.subPath.length === 1) {
                    if (!this.showDates) {
                        item.date = "";
                    }
                    const newItem = createTreeItem(
                        item.text,
                        item.date,
                        vscode.TreeItemCollapsibleState.None,
                        undefined,
                        item.text,
                        item.done,
                        item.subPath
                    );
                    newItem.contextValue = "doneTodo";
                    treeItems.push(newItem);
                } else if (!this.createdFolders.includes(baseFolderLabel)) {
                    const newFolder = createTreeItem(baseFolderLabel, "", vscode.TreeItemCollapsibleState.Collapsed);
                    newFolder.contextValue = "folder";
                    this.createdFolders.push(baseFolderLabel);
                    treeItems.push(newFolder);
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
        let treeItems: CustomTreeItem[] = [];
        if (this.foldersToCreate) {
            this.foldersToCreate.map((item: Folder) => {
                if (currentTreeItem.label) {
                    let tmpSubPaths: string[] = item.subPath.split("/");
                    if (tmpSubPaths.includes(currentTreeItem.label.toString())) {
                        // example: ["", "Folder_1", "Folder_2", ""]
                        if (currentTreeItem.label === tmpSubPaths[tmpSubPaths.length - 2]) {
                            const newFolder = createTreeItem(item.label, "", vscode.TreeItemCollapsibleState.Collapsed);
                            newFolder.contextValue = "folder";
                            this.createdFolders.push(item.label);
                            treeItems.push(newFolder);
                        }
                    }
                }
            });
        }
        if (this.todos) {
            this.todos.map((item: Todo) => {
                if (currentTreeItem.label) {
                    let tmpSubPaths: string[] = item.subPath.split("/");
                    if (tmpSubPaths.includes(currentTreeItem.label.toString())) {
                        // example: ["", "Folder_1", "Folder_2", ""]
                        if (currentTreeItem.label === tmpSubPaths[tmpSubPaths.length - 2]) {
                            if (!this.showDates) {
                                item.date = "";
                            }
                            const newItem = createTreeItem(
                                item.text,
                                item.date,
                                vscode.TreeItemCollapsibleState.None,
                                undefined,
                                item.text,
                                item.done,
                                item.subPath
                            );
                            newItem.contextValue = "doneTodo";
                            treeItems.push(newItem);
                        } else {
                            const folderLabel = tmpSubPaths[tmpSubPaths.indexOf(currentTreeItem.label.toString()) + 1];
                            const newFolder = createTreeItem(
                                folderLabel,
                                "",
                                vscode.TreeItemCollapsibleState.Collapsed
                            );
                            newFolder.contextValue = "folder";
                            this.createdFolders.push(folderLabel);
                            treeItems.push(newFolder);
                        }
                    }
                }
            });
        }
        return treeItems;
    }
}
