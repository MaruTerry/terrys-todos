import * as vscode from "vscode";
import { TodosTreeDataProvider } from "../providers/todosTreeProvider";
import { moveTodoById, setTodoNotDone } from "../logic/todo";
import { folderContainsItem, getFolderById, getParentFolderById, moveFolderById } from "../logic/folder";
import { getTodos } from "../settings/workspaceProperties";
import { CustomTreeItem } from "../interfaces/interfaces";
import { ContextValue, MimeType } from "../interfaces/enums";

/**
 * Controller for handling drag and drop features of todos in the sidebar tree view.
 */
export class TodosDragAndDropController implements vscode.TreeDragAndDropController<CustomTreeItem> {
    dropMimeTypes: readonly string[] = [MimeType.TODO, MimeType.FOLDER];
    dragMimeTypes: readonly string[] = [MimeType.TODO, MimeType.FOLDER];

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
        if (draggedItem.contextValue?.includes(ContextValue.TODO)) {
            dataTransfer.set(MimeType.TODO, new vscode.DataTransferItem(draggedItem));
        } else if (draggedItem.contextValue?.includes(ContextValue.FOLDER)) {
            dataTransfer.set(MimeType.FOLDER, new vscode.DataTransferItem(draggedItem));
        }
    }

    handleDrop?(
        target: any,
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        if (dataTransfer.get(MimeType.TODO)?.value !== "" && dataTransfer.get(MimeType.TODO)?.value !== undefined) {
            this.handleTodoDrop(target, dataTransfer.get(MimeType.TODO)?.value);
        } else if (
            dataTransfer.get(MimeType.FOLDER)?.value !== "" &&
            dataTransfer.get(MimeType.FOLDER)?.value !== undefined
        ) {
            this.handleFolderDrop(target, dataTransfer.get(MimeType.FOLDER)?.value);
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
                    if (target.contextValue === ContextValue.FOLDER) {
                        await moveTodoById(droppedTodo.id, target.id);
                    } else if (target.contextValue === ContextValue.TODO) {
                        const parentFolder = getParentFolderById(await getTodos(), target.id);
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
            const data = await getTodos();
            let droppedFolder = await getFolderById(droppedFolderTreeItem.id, data);
            if (droppedFolder) {
                if (target !== undefined) {
                    if (target.id) {
                        if (target.id !== droppedFolderTreeItem.id && !folderContainsItem(droppedFolder, target.id)) {
                            if (target.contextValue === ContextValue.FOLDER) {
                                await moveFolderById(droppedFolderTreeItem.id, target.id);
                            } else if (target.contextValue === ContextValue.TODO) {
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
}
