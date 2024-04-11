import * as vscode from "vscode";
import { generateCommitMessage } from "../logic/commitMessage";
import { getGitExtension } from "../util/gitSourceControl";
import { isWorkspaceOpened } from "../util/workspaceChecker";

/**
 * Registers all commands related to commit messages.
 *
 * @param context - The extension context.
 */
export function registerCommitMessageCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-todos.generateCommitMessage", async () => {
            if (isWorkspaceOpened()) {
                const git = getGitExtension()!;
                if (git.repositories !== undefined) {
                    if (git.repositories.length > 0) {
                        await generateCommitMessage(git.repositories[0]);
                    } else {
                        vscode.window.showErrorMessage("No git repositories found");
                    }
                } else {
                    vscode.window.showErrorMessage("No git repositories found");
                }
            }
        })
    );
}
