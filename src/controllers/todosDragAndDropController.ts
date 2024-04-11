import * as vscode from "vscode";
import { TodosTreeDataProvider } from "../providers/todosTreeProvider";
import { moveTodoById, setTodoNotDone } from "../logic/todo";
import { folderContainsItem, getFolderById, getParentFolderById, moveFolderById } from "../logic/folder";
import { getAllData } from "../settings/workspaceProperties";
import { CustomTreeItem } from "../interfaces/customTreeItem";

/**
 * Controller for handling drag and drop features of todos in the sidebar tree view.
 */
export class TodosDragAndDropController implements vscode.TreeDragAndDropController<CustomTreeItem> {
    dropMimeTypes: readonly string[] = ["item/todo", "item/done-todo", "folder/todo"];
    dragMimeTypes: readonly string[] = ["item/todo", "folder/todo"];

    todosTreeDataProvider: TodosTreeDataProvider;

    constructor(todosTreeDataProvider: TodosTreeDataProvider) {
        this.todosTreeDataProvider = todosTreeDataProvider;
    }

    handleDrag?(
        source: readonly CustomTreeItem[],
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        let draggedItem = source[0];
        if (draggedItem.contextValue?.includes("todo")) {
            dataTransfer.set("item/todo", new vscode.DataTransferItem(draggedItem));
        } else if (draggedItem.contextValue?.includes("folder")) {
            dataTransfer.set("folder/todo", new vscode.DataTransferItem(draggedItem));
        }
    }

    handleDrop?(
        target: any,
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        if (dataTransfer.get("item/todo")?.value !== "" && dataTransfer.get("item/todo")?.value !== undefined) {
            this.handleTodoDrop(target, dataTransfer.get("item/todo")?.value);
        } else if (
            dataTransfer.get("folder/todo")?.value !== "" &&
            dataTransfer.get("folder/todo")?.value !== undefined
        ) {
            this.handleFolderDrop(target, dataTransfer.get("folder/todo")?.value);
        } else if (
            dataTransfer.get("item/done-todo")?.value !== "" &&
            dataTransfer.get("item/done-todo")?.value !== undefined
        ) {
            this.handleDoneTodoDrop(target, JSON.parse(dataTransfer.get("item/done-todo")?.value));
        }
    }

    /**
     * Handles the drop of a todo.
     *
     * @param target - The target tree element that the drop is occurring on. When undefined, the target is the root.
     * @param droppedTodo - The dropped todo represented as a CustomTreeItem.
     */
    async handleTodoDrop(target: CustomTreeItem | undefined, droppedTodo: CustomTreeItem) {
        if (droppedTodo.id) {
            if (target !== undefined) {
                if (target.id) {
                    if (target.contextValue === "folder") {
                        await moveTodoById(droppedTodo.id, target.id);
                    } else if (target.contextValue === "todo") {
                        const parentFolder = getParentFolderById(await getAllData(), target.id);
                        if (parentFolder) {
                            await moveTodoById(droppedTodo.id, parentFolder.id);
                        } else {
                            await moveTodoById(droppedTodo.id);
                        }
                    }
                }
            } else {
                await moveTodoById(droppedTodo.id);
            }
        }
    }

    /**
     * Handles the drop of a folder.
     *
     * @param target - The target tree element that the drop is occurring on. When undefined, the target is the root.
     * @param droppedFolderTreeItem - The dropped todo represented as a CustomTreeItem.
     */
    async handleFolderDrop(target: CustomTreeItem | undefined, droppedFolderTreeItem: CustomTreeItem) {
        if (droppedFolderTreeItem.id) {
            const data = await getAllData();
            let droppedFolder = await getFolderById(droppedFolderTreeItem.id, data);
            if (droppedFolder) {
                if (target !== undefined) {
                    if (target.id) {
                        if (target.id !== droppedFolderTreeItem.id && !folderContainsItem(droppedFolder, target.id)) {
                            if (target.contextValue === "folder") {
                                await moveFolderById(droppedFolderTreeItem.id, target.id);
                            } else if (target.contextValue === "todo") {
                                const parentFolder = getParentFolderById(data, target.id);
                                if (parentFolder) {
                                    await moveFolderById(droppedFolderTreeItem.id, parentFolder.id);
                                } else {
                                    await moveFolderById(droppedFolderTreeItem.id);
                                }
                            }
                        }
                    }
                } else {
                    await moveFolderById(droppedFolderTreeItem.id);
                }
            }
        }
    }

    /**
     * Handles the drop of a done todo.
     *
     * @param target - The target tree element that the drop is occurring on. When undefined, the target is the root.
     * @param droppedTodo - The dropped todo represented as a CustomTreeItem.
     */
    async handleDoneTodoDrop(target: CustomTreeItem | undefined, droppedDoneTodo: CustomTreeItem) {
        if (droppedDoneTodo.id) {
            await setTodoNotDone(droppedDoneTodo);
            if (target !== undefined) {
                if (target.id) {
                    if (target.contextValue === "folder") {
                        await moveTodoById(droppedDoneTodo.id, target.id);
                    } else if (target.contextValue === "todo") {
                        const parentFolder = getParentFolderById(await getAllData(), target.id);
                        if (parentFolder) {
                            await moveTodoById(droppedDoneTodo.id, parentFolder.id);
                        } else {
                            await moveTodoById(droppedDoneTodo.id);
                        }
                    }
                }
            } else {
                await moveTodoById(droppedDoneTodo.id);
            }
        }
    }
}
