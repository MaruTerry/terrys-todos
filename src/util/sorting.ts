import { SortingMode, TodoColor, Type } from "../interfaces/enums";
import { Todo, Folder } from "../interfaces/interfaces";
import { getSortingMode } from "../settings/workspaceProperties";

/**
 * Sorts the given data based on the current sorting mode.
 *
 * @param data - The data to sort.
 */
export async function sortData(data: (Todo | Folder)[]) {
    const mode = await getSortingMode();
    switch (mode) {
        case SortingMode.DATE:
            await sortTodosByDate(data);
            break;
        case SortingMode.COLOR:
            await sortTodosByColor(data);
            break;
    }
}

/**
 * Sorts all todos by color.
 *
 * @param data - The data to sort.
 */
export async function sortTodosByColor(data: (Todo | Folder)[]) {
    // Sort all todos at the top level
    data.sort((a, b) => compareItemsByColor(a, b));

    // Sort todos within each folder
    data.forEach((item) => {
        if (item.type === Type.FOLDER) {
            sortFolderTodosByColor(item);
        }
    });
}

/**
 * Helper function to compare two items for sorting by color.
 *
 * @param a - The first item.
 * @param b - The second item.
 * @returns The comparison result.
 */
function compareItemsByColor(a: Todo | Folder, b: Todo | Folder): number {
    if (a.type === Type.FOLDER && b.type === Type.FOLDER) {
        return a.label.localeCompare(b.label); // Sort folders by label
    } else if (a.type === Type.TODO && b.type === Type.TODO) {
        return getColorIndex(a.color) - getColorIndex(b.color); // Sort todos by color
    } else {
        return a.type === Type.FOLDER ? -1 : 1; // Folders before todos
    }
}

/**
 * Helper function to get the index of a color.
 *
 * @param color - The color to get the index of.
 * @returns The index of the color.
 */
function getColorIndex(color: string): number {
    switch (color) {
        case TodoColor.BLUE:
            return 0;
        case TodoColor.GREEN:
            return 1;
        case TodoColor.YELLOW:
            return 2;
        case TodoColor.RED:
            return 3;
        default:
            return 4; // If color is not recognized, treat it as lowest priority
    }
}

/**
 * Helper function to recursively sort todos within a folder by color.
 *
 * @param folder - The folder to sort.
 */
function sortFolderTodosByColor(folder: Folder): void {
    folder.todos.sort((a, b) => compareItemsByColor(a, b));

    // Sort todos within subfolders recursively
    folder.folders.forEach((subfolder) => {
        sortFolderTodosByColor(subfolder);
    });
}

/**
 * Sorts all todos by date.
 *
 * @param data - The data to sort.
 */
export async function sortTodosByDate(data: (Todo | Folder)[]) {
    // Sort all todos at the top level
    data.sort((a, b) => compareItems(a, b));

    // Sort todos within each folder
    data.forEach((item) => {
        if (item.type === Type.FOLDER) {
            sortFolderTodos(item);
        }
    });
}

/**
 * Helper function to compare two items for sorting.
 *
 * @param a - The first item.
 * @param b - The second item.
 * @returns The comparison result.
 */
function compareItems(a: Todo | Folder, b: Todo | Folder): number {
    if (a.type === Type.FOLDER && b.type === Type.FOLDER) {
        return a.label.localeCompare(b.label); // Sort folders by label
    } else if (a.type === Type.TODO && b.type === Type.TODO) {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime(); // Sort todos by date
    } else {
        return a.type === Type.FOLDER ? -1 : 1; // Folders before todos
    }
}

/**
 * Helper function to recursively sort todos within a folder.
 *
 * @param folder - The folder to sort.
 */
function sortFolderTodos(folder: Folder): void {
    folder.todos.sort((a, b) => compareItems(a, b));

    // Sort todos within subfolders recursively
    folder.folders.forEach((subfolder) => {
        sortFolderTodos(subfolder);
    });
}
