/**
 * Defines the types of items in the todo application.
 */
export enum Type {
    FOLDER = "Folder",
    TODO = "Todo",
}

/**
 * Defines the sorting modes available for todos.
 */
export enum SortingMode {
    DATE = "date",
    COLOR = "color",
}

/**
 * Defines the possible colors for todos.
 */
export enum TodoColor {
    BLUE = "blue",
    GREEN = "green",
    RED = "red",
    YELLOW = "yellow",
}

/**
 * Defines MIME types for drag-and-drop operations.
 */
export enum MimeType {
    TODO = "item/todo",
    DONETODO = "item/done-todo",
    FOLDER = "folder/todo",
}

/**
 * Defines context values for tree items.
 */
export enum ContextValue {
    TODO = "todo",
    DONETODO = "doneTodo",
    FOLDER = "folder",
    NODATA = "noData",
}
