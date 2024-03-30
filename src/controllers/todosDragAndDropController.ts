import * as vscode from "vscode";
import { CustomTreeItem } from "../models/customTreeItem";
import { TodosTreeDataProvider } from "../providers/todosTreeProvider";
import { adjustSuperiorFolderLabel } from "../models/todo";

/**
 * Controller for handling drag and drop features of todos in the sidebar tree view.
 */
export class TodosDragAndDropController implements vscode.TreeDragAndDropController<CustomTreeItem> {
    dropMimeTypes: readonly string[] = ["item/todo", "item/done-todo", "folder/todo", "folder/done-todo"];
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
        }
    }

    /**
     * Handles the drop of a todo.
     *
     * @param target - The target tree element that the drop is occurring on. When undefined, the target is the root.
     * @param droppedTodo - The dropped todo represented as a CustomTreeItem.
     */
    handleTodoDrop(target: CustomTreeItem | undefined, droppedTodo: CustomTreeItem) {
        if (target !== undefined) {
            let newSuperiorFolderLabel = "";
            if (target.superiorFolderLabel !== undefined && target.label !== undefined) {
                newSuperiorFolderLabel =
                    target.contextValue === "folder"
                        ? target.label.toString()
                        : target.contextValue === "todo"
                        ? target.superiorFolderLabel
                        : "";
            }
            adjustSuperiorFolderLabel(droppedTodo, newSuperiorFolderLabel);
        } else {
            adjustSuperiorFolderLabel(droppedTodo, "");
        }
    }
}
