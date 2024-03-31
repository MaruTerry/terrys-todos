import * as vscode from "vscode";
import { Todo } from "../models/todo";
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
    if (oldTodos && data && doneTodos) {
        oldTodos.forEach((todoAsArray) => {
            let newTodo: Todo = {
                type: "Todo",
                id: getNonce(),
                text: todoAsArray[0],
                date: todoAsArray[2],
                color: "blue",
            };
            if (todoAsArray[1] === "false") {
                data.push(newTodo);
            } else if (todoAsArray[1] === "true") {
                doneTodos.push(newTodo);
            }
        });
        await updateDataInWorkspace(data);
        await updateDoneTodosInWorkspace(doneTodos);
    }
}
