import * as vscode from "vscode";
import { generateCommitMessage } from "../logic/commitMessage";
import { getGitExtension } from "../util/gitSourceControl";
import { isWorkspaceOpened } from "../util/workspace";

/**
 * Registers all commands related to commit messages.
 *
 * @param context - The extension context.
 */
export function registerCommitMessageCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.generateCommitMessage", async () => {
            if (!isWorkspaceOpened()) {
                return;
            }

            const git = getGitExtension()!;
            if (git.repositories === undefined || git.repositories.length === 0) {
                vscode.window.showErrorMessage("No git repositories found");
                return;
            }

            await generateCommitMessage(git.repositories[0]);
        })
    );
}
