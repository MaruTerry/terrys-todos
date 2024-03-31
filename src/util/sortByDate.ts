import { Folder } from "../models/folder";
import { Todo } from "../models/todo";

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
        if (item.type === "Folder") {
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
    if (a.type === "Folder" && b.type === "Folder") {
        return a.label.localeCompare(b.label); // Sort folders by label
    } else if (a.type === "Todo" && b.type === "Todo") {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA.getTime() - dateB.getTime(); // Sort todos by date
    } else {
        return a.type === "Folder" ? -1 : 1; // Folders before todos
    }
}

/**
 * Helper function to parse a date string in the format "day.month.year" to a Date object.
 *
 * @param dateString - The date string to parse.
 * @returns The parsed Date object.
 */
function parseDate(dateString: string): Date {
    const parts = dateString.split(".");
    // Parse the date components and create a Date object
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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
