import * as vscode from "vscode";

/**
 * Custom interface extending vscode.TreeItem to include additional properties.
 */
export interface CustomTreeItem extends vscode.TreeItem {
    description?: string | boolean;
    level?: string;
    text?: string;
    done?: boolean;
}

/**
 * Creates a custom tree item with specified properties.
 *
 * @param label - The label for the tree item.
 * @param description - The description for the tree item.
 * @param collapsibleState - The collapsible state for the tree item.
 * @param level - The level property for the tree item.
 * @param text - The text of a todo.
 * @param done - The state of a todo.
 * @returns A CustomTreeItem with the specified properties.
 */
export function createTreeItem(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed,
    level?: string,
    text?: string,
    done?: boolean
): CustomTreeItem {
    const treeItem = new vscode.TreeItem(label, collapsibleState) as CustomTreeItem;
    treeItem.description = description;
    treeItem.contextValue = level ? level : "detail";
    treeItem.level = level;
    treeItem.text = text;
    treeItem.done = done;
    return treeItem;
}
