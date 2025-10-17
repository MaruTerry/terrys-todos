import * as vscode from "vscode";
import * as path from "path";
import {
    getIgnoredFileLines,
    getIgnoredFilePaths,
    getTodos,
    showDates,
    showInlineComments,
} from "../settings/workspaceProperties";
import { CustomTreeItem, Todo, Folder } from "../interfaces/interfaces";
import { ContextValue, TodoColor, Type } from "../interfaces/enums";
import { formatDate } from "../util/date";
import { getInlineComments } from "../logic/inlineTodos";
import { isWorkspaceOpened } from "../util/workspace";

/**
 * Tree data provider for displaying todos in the sidebar tree view.
 */
export class TodosTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private todosData: (Todo | Folder)[] = [];
    private inlineComments: Todo[] = [];
    private showDates: boolean = false;
    private showInlineComments: boolean = true;
    private ignoredFilePaths: string[] = [];
    private ignoredFileLines: string[] = [];

    /**
     * Constructor for the TodosTreeDataProvider.
     */
    constructor() {
        vscode.workspace.onDidChangeConfiguration(() => {
            this.refresh(true, true);
        });
        this.refresh(false, true);
    }

    /**
     * Refreshes the tree view with the latest project data.
     *
     * @param hideNotification - Flag to hide the refresh notification.
     */
    async refresh(skipInlineCommentsScan?: boolean, hideNotification?: boolean): Promise<void> {
        this.todosData = [];
        await getTodos()
            .then((data) => {
                this.todosData = data;
            })
            .catch(() => {
                this.todosData = [];
            });
        if (!skipInlineCommentsScan) {
            await getInlineComments()
                .then((data) => {
                    this.inlineComments = data;
                })
                .catch(() => {
                    this.inlineComments = [];
                });
        }
        this.showDates = await showDates();
        this.showInlineComments = await showInlineComments();
        this.ignoredFilePaths = await getIgnoredFilePaths();
        this.ignoredFileLines = await getIgnoredFileLines();
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
     * Gets the children for the given tree item.
     *
     * @param currentTreeItem - The current tree item.
     * @returns The children of the current tree item.
     */
    getChildren(currentTreeItem?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (!currentTreeItem) {
            if (isWorkspaceOpened() === false) {
                const noWorkspaceItem = new vscode.TreeItem("", vscode.TreeItemCollapsibleState.None) as CustomTreeItem;
                noWorkspaceItem.description = "⚠️ Please open a workspace to use Terry's Todos";
                noWorkspaceItem.contextValue = ContextValue.NOWORKSPACE;
                return Promise.resolve([noWorkspaceItem]);
            }
            return Promise.resolve(this.getBaseItems());
        } else {
            return Promise.resolve(this.getFollowUpItems(currentTreeItem));
        }
    }

    /**
     * Groups inline comments by their file path.
     */
    private groupInlineCommentsByFile(): CustomTreeItem[] {
        const fileMap = new Map<string, Todo[]>();

        this.inlineComments.forEach((todo) => {
            // NOTE: Assumes the Todo object for inline comments has a 'filePath' property.
            const filePath = todo.filePath;

            if (filePath && !this.ignoredFilePaths.includes(filePath)) {
                const todos = fileMap.get(filePath) || [];
                todos.push(todo);
                fileMap.set(filePath, todos);
            }
        });

        // Convert the map into an array of CustomTreeItem (FileGroupItem)
        return Array.from(fileMap.entries())
            .map(([filePath, todos]) => {
                const fileName = path.basename(filePath);
                const fileGroupItem: CustomTreeItem = new vscode.TreeItem(
                    fileName,
                    vscode.TreeItemCollapsibleState.Collapsed
                ) as CustomTreeItem;

                fileGroupItem.id = filePath;
                fileGroupItem.contextValue = ContextValue.INLINE_FILE_GROUP;
                fileGroupItem.filePath = filePath;
                fileGroupItem.todos = todos;
                fileGroupItem.resourceUri = vscode.Uri.file(filePath);
                fileGroupItem.iconPath = vscode.ThemeIcon.File;

                return fileGroupItem;
            })
            .sort((a, b) => a.label!.toString().localeCompare(b.label!.toString()));
    }

    /**
     * Gets the base items for the tree view.
     *
     * @returns The base items for the tree view.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        let newItem: CustomTreeItem;

        if (this.showInlineComments) {
            // Workspace Root (User-defined todos/folders)
            newItem = new vscode.TreeItem("Workspace", vscode.TreeItemCollapsibleState.Expanded) as CustomTreeItem;
            newItem.id = ContextValue.WORKSPACE;
            newItem.contextValue = ContextValue.WORKSPACE;
            newItem.folders = this.todosData.filter((item) => item.type === Type.FOLDER) as Folder[];
            newItem.todos = this.todosData.filter((item) => item.type === Type.TODO) as Todo[];
            newItem.iconPath = {
                light: path.join(__filename, "..", "..", "..", "resources", "light", "root-folder.svg"),
                dark: path.join(__filename, "..", "..", "..", "resources", "dark", "root-folder.svg"),
            };
            newItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            treeItems.push(newItem);

            // Inline Comments Category
            newItem = new vscode.TreeItem(
                "Inline Comments",
                vscode.TreeItemCollapsibleState.Collapsed
            ) as CustomTreeItem;
            newItem.id = ContextValue.INLINE_COMMENTS;
            newItem.contextValue = ContextValue.INLINE_COMMENTS;
            newItem.iconPath = {
                light: path.join(__filename, "..", "..", "..", "resources", "light", "code.svg"),
                dark: path.join(__filename, "..", "..", "..", "resources", "dark", "code.svg"),
            };
            newItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;

            treeItems.push(newItem);
        } else {
            // User-defined todos and folders if inline comments are not shown
            this.todosData.map((object: Todo | Folder) => {
                if (object.type === Type.TODO) {
                    const newItem = new vscode.TreeItem(
                        object.text,
                        vscode.TreeItemCollapsibleState.None
                    ) as CustomTreeItem;
                    newItem.id = object.id;
                    newItem.description = this.showDates ? formatDate(object.date) : "";
                    newItem.text = object.text;
                    if (object.color === TodoColor.WHITE) {
                        newItem.iconPath = path.join(
                            __filename,
                            "..",
                            "..",
                            "..",
                            "resources",
                            "circles",
                            "white-circle.svg"
                        );
                    } else if (object.color === TodoColor.BLUE) {
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
                    newItem.contextValue = ContextValue.TODO;
                    treeItems.push(newItem);
                } else if (object.type === Type.FOLDER) {
                    const newItem = new vscode.TreeItem(
                        object.label,
                        vscode.TreeItemCollapsibleState.Expanded
                    ) as CustomTreeItem;
                    newItem.id = object.id;
                    newItem.folders = object.folders;
                    newItem.todos = object.todos;
                    newItem.contextValue = ContextValue.FOLDER;
                    treeItems.push(newItem);
                }
            });
        }

        return treeItems;
    }

    /**
     * Gets the follow-up items for the given tree item.
     *
     * @param currentTreeItem - The current tree item.
     * @returns The follow-up items for the current tree item.
     */
    private getFollowUpItems(currentTreeItem: CustomTreeItem): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];

        // --- Handle Inline Comments Category ---
        if (currentTreeItem.contextValue === ContextValue.INLINE_COMMENTS) {
            if (this.inlineComments.length === 0) {
                const newItem = new vscode.TreeItem(
                    "No todos found :)",
                    vscode.TreeItemCollapsibleState.None
                ) as CustomTreeItem;
                newItem.contextValue = ContextValue.NODATA;
                treeItems.push(newItem);
                return treeItems;
            }

            // RETURN THE FILE GROUP ITEMS (Parent nodes for inline todos)
            return this.groupInlineCommentsByFile();
        }

        // --- Handle File Group (Inline Todos Children) ---
        if (currentTreeItem.contextValue === ContextValue.INLINE_FILE_GROUP) {
            // Map the individual Todos under the file group
            currentTreeItem.todos?.forEach((todo) => {
                if (!this.ignoredFileLines.includes(`${todo.filePath}/${todo.lineNumber}`)) {
                    const newItem = new vscode.TreeItem(
                        todo.text,
                        vscode.TreeItemCollapsibleState.None
                    ) as CustomTreeItem;
                    newItem.id = todo.id;

                    // Description and Command for inline todos
                    // NOTE: Assumes todo.filePath, todo.fileName, and todo.lineNumber are available
                    newItem.description = `Line ${todo.lineNumber}`;
                    newItem.command = {
                        command: "vscode.open",
                        title: "Open File",
                        arguments: [
                            todo.filePath,
                            { selection: new vscode.Range(todo.lineNumber! - 1, 0, todo.lineNumber! - 1, 0) },
                        ],
                    };
                    newItem.contextValue = ContextValue.INLINE_TODO;
                    newItem.iconPath = {
                        light: path.join(__filename, "..", "..", "..", "resources", "circles", "white-circle.svg"),
                        dark: path.join(__filename, "..", "..", "..", "resources", "circles", "white-circle.svg"),
                    };
                    newItem.filePath = currentTreeItem?.filePath;
                    newItem.lineNumber = todo.lineNumber;

                    treeItems.push(newItem);
                }
            });
            return treeItems;
        }

        // --- Handle Regular Folders (Workspace and nested folders) ---
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
        if (currentTreeItem.todos) {
            currentTreeItem.todos.forEach((todo) => {
                const newItem = new vscode.TreeItem(todo.text, vscode.TreeItemCollapsibleState.None) as CustomTreeItem;
                newItem.id = todo.id;
                newItem.description = this.showDates ? formatDate(todo.date) : "";
                newItem.contextValue = ContextValue.TODO;
                newItem.text = todo.text;
                if (todo.color === TodoColor.WHITE) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "white-circle.svg"
                    );
                } else if (todo.color === TodoColor.BLUE) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "blue-circle.svg"
                    );
                } else if (todo.color === TodoColor.YELLOW) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "yellow-circle.svg"
                    );
                } else if (todo.color === TodoColor.RED) {
                    newItem.iconPath = path.join(
                        __filename,
                        "..",
                        "..",
                        "..",
                        "resources",
                        "circles",
                        "red-circle.svg"
                    );
                } else if (todo.color === TodoColor.GREEN) {
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
                treeItems.push(newItem);
            });
        }

        return treeItems;
    }
}
