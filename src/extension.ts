import * as vscode from "vscode";
import { registerTodoCommands } from "./commands/todoCommands";
import { registerFolderCommands } from "./commands/folderCommands,";
import { registerSettingCommands } from "./commands/settingCommands";
import { registerCommitMessageCommands } from "./commands/commitMessageCommands";
import { registerTreeViews } from "./commands/registerTreeViews";

export async function activate(context: vscode.ExtensionContext) {
    registerTodoCommands(context);
    registerFolderCommands(context);
    registerSettingCommands(context);
    registerCommitMessageCommands(context);
    registerTreeViews(context);
}

export function deactivate() {}
