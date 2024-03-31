import * as vscode from "vscode";
import { Todo } from "./todo";
import { Folder } from "./folder";

/**
 * Custom interface extending vscode.TreeItem to include additional properties.
 */
export interface CustomTreeItem extends vscode.TreeItem {
    description?: string | boolean;
    text?: string;
    done?: boolean;
    folders?: Folder[];
    todos?: Todo[];
}