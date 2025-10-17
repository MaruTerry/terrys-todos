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
    WHITE = "white",
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
    FOLDER = "folder/todo",
}

/**
 * Defines context values for tree items.
 */
export enum ContextValue {
    TODO = "todo",
    INLINE_TODO = "inlineTodo",
    DONETODO = "doneTodo",
    FOLDER = "folder",
    WORKSPACE = "workspace",
    INLINE_COMMENTS = "inlineComments",
    INLINE_FILE_GROUP = "inlineFileGroup",
    NODATA = "noData",
    NOWORKSPACE = "noWorkspace",
}
