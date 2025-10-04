import * as vscode from "vscode";
import { setTodoDone } from "../logic/todo";
import { setFolderDone } from "../logic/folder";
import { CustomTreeItem } from "../interfaces/interfaces";
import { ContextValue, MimeType } from "../interfaces/enums";

/**
 * Controller for handling drag and drop features of done todos in the sidebar tree view.
 */
export class DoneTodosDragAndDropController implements vscode.TreeDragAndDropController<CustomTreeItem> {
    dropMimeTypes: readonly MimeType[] = [MimeType.TODO, MimeType.FOLDER];
    dragMimeTypes: readonly MimeType[] = [MimeType.DONETODO];

    handleDrag?(
        source: readonly CustomTreeItem[],
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        let draggedItem = source[0];
        if (draggedItem.contextValue?.includes(ContextValue.DONETODO)) {
            dataTransfer.set(MimeType.DONETODO, new vscode.DataTransferItem(draggedItem));
        }
    }

    handleDrop?(
        target: any,
        dataTransfer: vscode.DataTransfer,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        if (dataTransfer.get(MimeType.TODO)?.value !== "" && dataTransfer.get(MimeType.TODO)?.value !== undefined) {
            this.handleTodoDrop(target, JSON.parse(dataTransfer.get(MimeType.TODO)?.value));
        } else if (
            dataTransfer.get(MimeType.FOLDER)?.value !== "" &&
            dataTransfer.get(MimeType.FOLDER)?.value !== undefined
        ) {
            this.handleFolderDrop(target, JSON.parse(dataTransfer.get(MimeType.FOLDER)?.value));
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
