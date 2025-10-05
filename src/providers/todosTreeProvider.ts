import * as vscode from "vscode";
import * as path from "path";
import { getGlobalTodos, getTodos, showDates } from "../settings/workspaceProperties";
import { CustomTreeItem, Todo, Folder } from "../interfaces/interfaces";
import { ContextValue, TodoColor, Type } from "../interfaces/enums";
import { formatDate } from "../util/date";
import { getInlineComments } from "../logic/inlineTodos";

/**
 * Tree data provider for displaying todos in the sidebar tree view.
 */
export class TodosTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private todos: (Todo | Folder)[] = [];
    private todosGlobal: (Todo | Folder)[] = [];
    private inlineComments: Todo[] = [];
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
        this.todosGlobal = [];
        this.showDates = await showDates();
        await getTodos()
            .then((data) => {
                this.todos = data;
            })
            .catch(() => {
                this.todos = [];
            });
        await getGlobalTodos()
            .then((data) => {
                this.todosGlobal = data;
            })
            .catch(() => {
                this.todosGlobal = [];
            });
        await getInlineComments()
            .then((data) => {
                this.inlineComments = data;
            })
            .catch(() => {
                this.inlineComments = [];
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
            return Promise.resolve(this.getBaseItems());
        } else {
            return Promise.resolve(this.getFollowUpItems(currentTreeItem));
        }
    }

    // /**
    //  * Gets the base items for the root level.
    //  *
    //  * @returns An array of tree items for the root level.
    //  */
    // private getBaseItems(): CustomTreeItem[] {
    //     let treeItems: CustomTreeItem[] = [];
    //     this.data.map((object: Todo | Folder) => {
    //         if (object.type === Type.TODO) {
    //             const newItem = new vscode.TreeItem(
    //                 object.text,
    //                 vscode.TreeItemCollapsibleState.None
    //             ) as CustomTreeItem;
    //             newItem.id = object.id;
    //             newItem.description = this.showDates ? formatDate(object.date) : "";
    //             newItem.text = object.text;
    //             if (object.color === TodoColor.BLUE) {
    //                 newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "blue-circle.svg");
    //             } else if (object.color === TodoColor.YELLOW) {
    //                 newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "yellow-circle.svg");
    //             } else if (object.color === TodoColor.RED) {
    //                 newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "red-circle.svg");
    //             } else if (object.color === TodoColor.GREEN) {
    //                 newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "green-circle.svg");
    //             }
    //             newItem.contextValue = ContextValue.TODO;
    //             treeItems.push(newItem);
    //         } else if (object.type === Type.FOLDER) {
    //             const newItem = new vscode.TreeItem(
    //                 object.label,
    //                 vscode.TreeItemCollapsibleState.Expanded
    //             ) as CustomTreeItem;
    //             newItem.id = object.id;
    //             newItem.folders = object.folders;
    //             newItem.todos = object.todos;
    //             newItem.contextValue = ContextValue.FOLDER;
    //             treeItems.push(newItem);
    //         }
    //     });
    //     return treeItems;
    // }

    /**
     * Gets the base items for the root level.
     *
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];

        let newItem = new vscode.TreeItem("Workspace", vscode.TreeItemCollapsibleState.Expanded) as CustomTreeItem;
        newItem.id = "workspace";
        newItem.contextValue = "workspace";
        newItem.folders = this.todos.filter((item) => item.type === Type.FOLDER);
        newItem.todos = this.todos.filter((item) => item.type === Type.TODO);
        newItem.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", "root-folder.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", "root-folder.svg"),
        };
        treeItems.push(newItem);

        newItem = new vscode.TreeItem("Global", vscode.TreeItemCollapsibleState.Collapsed) as CustomTreeItem;
        newItem.id = "global";
        newItem.contextValue = "global";
        newItem.folders = this.todosGlobal.filter((item) => item.type === Type.FOLDER);
        newItem.todos = this.todosGlobal.filter((item) => item.type === Type.TODO);
        newItem.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", "globe.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", "globe.svg"),
        };
        treeItems.push(newItem);

        if (this.inlineComments.length > 0) {
            newItem = new vscode.TreeItem(
                "Inline Comments",
                vscode.TreeItemCollapsibleState.Collapsed
            ) as CustomTreeItem;
            newItem.id = "inline-comments";
            newItem.contextValue = "inline-comments";
            newItem.todos = this.inlineComments;
            newItem.iconPath = {
                light: path.join(__filename, "..", "..", "..", "resources", "light", "code.svg"),
                dark: path.join(__filename, "..", "..", "..", "resources", "dark", "code.svg"),
            };
            treeItems.push(newItem);
        }

        return treeItems;
    }

    /**
     * Gets the follow-up items for a given folder.
     *
     * @param currentTreeItem - The current tree item representing a folder.
     * @returns An array of tree items for the follow-up level.
     */
    private getFollowUpItems(currentTreeItem: CustomTreeItem): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        if (currentTreeItem.id === "workspace") {
            currentTreeItem.iconPath =
                currentTreeItem.collapsibleState === vscode.TreeItemCollapsibleState.Expanded
                    ? {
                          light: path.join(
                              __filename,
                              "..",
                              "..",
                              "..",
                              "resources",
                              "light",
                              "root-folder-opened.svg"
                          ),
                          dark: path.join(__filename, "..", "..", "..", "resources", "dark", "root-folder-opened.svg"),
                      }
                    : {
                          light: path.join(__filename, "..", "..", "..", "resources", "light", "root-folder.svg"),
                          dark: path.join(__filename, "..", "..", "..", "resources", "dark", "root-folder.svg"),
                      };
        }
        if (currentTreeItem.todos) {
            currentTreeItem.todos.forEach((todo) => {
                const newItem = new vscode.TreeItem(todo.text, vscode.TreeItemCollapsibleState.None) as CustomTreeItem;
                newItem.id = todo.id;
                if (currentTreeItem.id === "inline-comments" && todo.fileName && todo.lineNumber) {
                    newItem.description = `${todo.fileName} (Line ${todo.lineNumber})`;
                    newItem.command = {
                        command: "vscode.open",
                        title: "Open File",
                        arguments: [todo.filePath, todo.lineNumber],
                    };
                } else {
                    newItem.description = this.showDates ? formatDate(todo.date) : "";
                }
                newItem.text = todo.text;
                if (todo.color === TodoColor.WHITE) {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "white-circle.svg");
                } else if (todo.color === TodoColor.BLUE) {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "blue-circle.svg");
                } else if (todo.color === TodoColor.YELLOW) {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "yellow-circle.svg");
                } else if (todo.color === TodoColor.RED) {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "red-circle.svg");
                } else if (todo.color === TodoColor.GREEN) {
                    newItem.iconPath = path.join(__filename, "..", "..", "..", "resources", "green-circle.svg");
                }
                newItem.contextValue = ContextValue.TODO;
                treeItems.push(newItem);
            });
        }
        if (currentTreeItem.folders) {
            currentTreeItem.folders.forEach((folder) => {
                const newItem = new vscode.TreeItem(
                    folder.label,
                    vscode.TreeItemCollapsibleState.Expanded
                ) as CustomTreeItem;
                newItem.id = folder.id;
                newItem.folders = folder.folders;
                newItem.todos = folder.todos;
                newItem.contextValue = ContextValue.FOLDER;
                treeItems.push(newItem);
            });
        }
        return treeItems;
    }
}
