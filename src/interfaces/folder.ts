import { Todo } from "./todo";

/**
 * Interface representing a Folder, containing the type "Folder", an id string, a label string, a folders array and a todos array.
 */
export interface Folder {
    type: "Folder";
    id: string;
    label: string;
    folders: Folder[];
    todos: Todo[];
}
