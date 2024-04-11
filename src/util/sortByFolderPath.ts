import { Todo } from "../interfaces/todo";

/**
 * Sorts all done todos by their folder path alphabeticially.
 *
 * @param data - The done todos to sort.
 */
export async function sortTodosByFolderPath(doneTodos: Todo[]) {
    doneTodos.sort((a, b) => {
        if (a.folderPath && b.folderPath) {
            return a.folderPath.join("").localeCompare(b.folderPath.join(""));
        }
        return 0;
    });
}
