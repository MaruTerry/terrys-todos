// Description: Utility functions for interacting with the Git Extension in VS Code.
import * as vscode from "vscode";
import { GitExtension, Repository, Status } from "../api/git";

/**
 * Fetch the commit message in the Git Extension.
 */
export function getCommitMsg(repository: Repository): string {
    return repository.inputBox.value;
}

/**
 * Set the commit message in the Git Extension pane's input.
 */
export function setCommitMsg(repository: Repository, msg: string) {
    repository.inputBox.value = msg;
}

/**
 * Return VS Code's built-in Git extension.
 */
export function getGitExtension() {
    const vscodeGit = vscode.extensions.getExtension<GitExtension>("vscode.git");
    const gitExtension = vscodeGit && vscodeGit.exports;

    return gitExtension && gitExtension.getAPI(1);
}

/**
 * Return information about currently modified files from the active Git repository.
 * For each modified file, returns its file name.
 */
export function getModifiedFiles(repository: Repository): string[] {
    const modifiedFiles: string[] = [];

    repository.state.workingTreeChanges.forEach((change) => {
        if (change.status === Status.MODIFIED) {
            const fileName = change.uri.path.split("/").pop() || "";
            modifiedFiles.push(fileName);
        }
    });

    return modifiedFiles;
}

/**
 * Return information about currently untracked files from the active Git repository.
 * For each untracked file, returns its file name.
 */
export function getUntrackedFiles(repository: Repository): string[] {
    const addedFiles: string[] = [];

    repository.state.workingTreeChanges.forEach((change) => {
        if (change.status === Status.UNTRACKED) {
            const fileName = change.uri.path.split("/").pop() || "";
            addedFiles.push(fileName);
        }
    });

    return addedFiles;
}

/**
 * Return information about currently deleted files from the active Git repository.
 * For each deleted file, returns its file name.
 */
export function getDeletedFiles(repository: Repository): string[] {
    const deletedFiles: string[] = [];

    repository.state.workingTreeChanges.forEach((change) => {
        if (change.status === Status.DELETED) {
            const fileName = change.uri.path.split("/").pop() || "";
            deletedFiles.push(fileName);
        }
    });

    return deletedFiles;
}
