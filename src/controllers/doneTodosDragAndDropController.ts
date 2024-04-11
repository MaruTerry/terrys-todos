import * as vscode from "vscode";
import { setTodoDone } from "../logic/todo";
import { setFolderDone } from "../logic/folder";
import { CustomTreeItem } from "../interfaces/customTreeItem";

/**
 * Controller for handling drag and drop features of done todos in the sidebar tree view.
 */
export class DoneTodosDragAndDropController implements vscode.TreeDragAndDropController<CustomTreeItem> {
    dropMimeTypes: readonly string[] = ["item/todo", "folder/todo"];
    dragMimeTypes: readonly string[] = ["item/done-todo"];

    handleDrag?(
        source: readonly CustomTreeItem[],
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        let draggedItem = source[0];
        if (draggedItem.contextValue?.includes("doneTodo")) {
            dataTransfer.set("item/done-todo", new vscode.DataTransferItem(draggedItem));
        }
    }

    handleDrop?(
        target: any,
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        if (dataTransfer.get("item/todo")?.value !== "" && dataTransfer.get("item/todo")?.value !== undefined) {
            this.handleTodoDrop(target, JSON.parse(dataTransfer.get("item/todo")?.value));
        } else if (
            dataTransfer.get("folder/todo")?.value !== "" &&
            dataTransfer.get("folder/todo")?.value !== undefined
        ) {
            this.handleFolderDrop(target, JSON.parse(dataTransfer.get("folder/todo")?.value));
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
            setTodoDone(droppedTodo);
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
            setFolderDone(droppedFolderTreeItem);
        }
    }
}
