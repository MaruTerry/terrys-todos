import * as vscode from "vscode";
import { Repository } from "../api/git";
import {
    deleteIncludedTodos,
    getDoneTodos,
    includeDoneTodosOnce,
    updateDoneTodosInWorkspace,
} from "../settings/workspaceProperties";
import { getDeletedFiles, getModifiedFiles, getUntrackedFiles, setCommitMsg } from "../util/gitSourceControl";
import { sortTodosByFolderPath } from "../util/sortByFolderPath";
import { deleteDoneTodoById } from "./todo";

export async function generateCommitMessage(repository: Repository) {
    let doneTodos = await getDoneTodos();
    sortTodosByFolderPath(doneTodos);

    let commitMsg = getCommitMessageBasedOnGitChanges(repository);

    if (commitMsg.length > 0) {
        if (doneTodos.length > 0 && doneTodos.some((todo) => !todo.addedToCommitMessage)) {
            commitMsg += "------------------------------\n";
            let formattedTodo = "";
            for (const todo of doneTodos) {
                if (!todo.addedToCommitMessage) {
                    const folderLabel = todo.folderPath.length > 0 ? `# ${todo.folderPath.join(" > ")}\n` : "";
                    if (!formattedTodo.includes(folderLabel)) {
                        formattedTodo =
                            todo.folderPath.length > 0
                                ? `# ${todo.folderPath.join(" > ")}
✅ ${todo.text}`
                                : `✅ ${todo.text}`;
                    } else {
                        formattedTodo = `✅ ${todo.text}`;
                    }
                    commitMsg += `${formattedTodo}\n`;
                    if (await includeDoneTodosOnce()) {
                        todo.addedToCommitMessage = true;
                    }
                    if (await deleteIncludedTodos()) {
                        deleteDoneTodoById(todo.id, doneTodos);
                    }
                }
            }
            await updateDoneTodosInWorkspace(doneTodos);
        }

        commitMsg = commitMsg.trimEnd();
        setCommitMsg(repository, commitMsg);
    } else {
        vscode.window.showInformationMessage("No changes to commit");
    }
}

/**
 * Gets a commit message based on git changes.
 *
 * @param repository - The repository to get the changes from.
 * @returns The generated commit message as a string.
 */
function getCommitMessageBasedOnGitChanges(repository: Repository): string {
    const untrackedFiles = getUntrackedFiles(repository);
    const modifiedFiles = getModifiedFiles(repository);
    const deletedFiles = getDeletedFiles(repository);
    let commitMsg = "";
    commitMsg +=
        untrackedFiles.length > 3
            ? "🆕 Added " + untrackedFiles.length + " files\n"
            : untrackedFiles.length > 1
            ? "🆕 Added " +
              untrackedFiles.slice(0, -1).join(", ") +
              " and " +
              untrackedFiles[untrackedFiles.length - 1] +
              "\n"
            : untrackedFiles.length === 1
            ? "🆕 Added " + untrackedFiles[0] + "\n"
            : "";
    commitMsg +=
        modifiedFiles.length > 3
            ? "📝 Modified " + modifiedFiles.length + " files\n"
            : modifiedFiles.length > 1
            ? "📝 Modified " +
              modifiedFiles.slice(0, -1).join(", ") +
              " and " +
              modifiedFiles[modifiedFiles.length - 1] +
              "\n"
            : modifiedFiles.length === 1
            ? "📝 Modified " + modifiedFiles[0] + "\n"
            : "";
    commitMsg +=
        deletedFiles.length > 3
            ? "🗑️ Deleted " + deletedFiles.length + " files\n"
            : deletedFiles.length > 1
            ? "🗑️ Deleted " +
              deletedFiles.slice(0, -1).join(", ") +
              " and " +
              deletedFiles[deletedFiles.length - 1] +
              "\n"
            : deletedFiles.length === 1
            ? "🗑️ Deleted " + deletedFiles[0] + "\n"
            : "";
    return commitMsg;
}
