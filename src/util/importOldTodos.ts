import * as vscode from "vscode";
import { Todo } from "../interfaces/todo";
import { getNonce } from "./getNonce";
import {
    getAllData,
    getAllDoneTodos,
    updateDataInWorkspace,
    updateDoneTodosInWorkspace,
} from "../settings/workspaceProperties";

/**
 * Imports todos saved in the old datastructure format.
 */
export async function importOldTodos() {
    let data = await getAllData();
    let doneTodos = await getAllDoneTodos();
    const oldTodos: string[][] | undefined = await vscode.workspace.getConfiguration().get("terrys-todos.todos");
    if (oldTodos) {
        oldTodos.forEach((todoAsArray) => {
            let newTodo: Todo = {
                type: "Todo",
                id: getNonce(),
                text: todoAsArray[0],
                date: todoAsArray[2],
                color: "blue",
                folderPath: [],
                addedToCommitMessage: false,
            };
            if (todoAsArray[1] === "false") {
                data.push(newTodo);
            } else if (todoAsArray[1] === "true") {
                doneTodos.push(newTodo);
            }
        });
    }
    data.forEach((object) => {
        if (object.type === "Todo") {
            if (object.folderPath === undefined) {
                object.folderPath = [];
            }
            if (object.addedToCommitMessage === undefined) {
                object.addedToCommitMessage = false;
            }
        }
    });
    doneTodos.forEach((doneTodo) => {
        if (doneTodo.folderPath === undefined) {
            doneTodo.folderPath = [];
        }
        if (doneTodo.addedToCommitMessage === undefined) {
            doneTodo.addedToCommitMessage = false;
        }
    });
    await updateDataInWorkspace(data);
    await updateDoneTodosInWorkspace(doneTodos);
}
