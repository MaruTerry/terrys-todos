/**
 * Interface representing a Todo, containing the type "Todo", an id string, a text string, a done boolean and a date string.
 */
export interface Todo {
    type: "Todo";
    id: string;
    text: string;
    date: string;
    color: string;
    folderPath: string[];
    addedToCommitMessage: boolean;
}
