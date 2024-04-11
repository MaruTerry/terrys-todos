import * as vscode from "vscode";
import { importOldTodos } from "./util/importOldTodos";
import { registerTodoCommands } from "./commands/todoCommands";
import { registerFolderCommands } from "./commands/folderCommands,";
import { registerSettingCommands } from "./commands/settingCommands";
import { registerCommitMessageCommands } from "./commands/commitMessageCommands";
import { registerTreeViews } from "./commands/registerTreeViews";

export async function activate(context: vscode.ExtensionContext) {
    await importOldTodos();
    registerTodoCommands(context);
    registerFolderCommands(context);
    registerSettingCommands(context);
    registerCommitMessageCommands(context);
    registerTreeViews(context);
}

export function deactivate() {}
