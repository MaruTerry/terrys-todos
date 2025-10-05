import * as vscode from "vscode";
import { TodoColor } from "../interfaces/enums";
import { createTodoObject, Todo } from "../interfaces/interfaces";

/**
 * Get all 'TODO' instances from the current workspace based on common comment syntax.
 * @returns A promise with an array of Todo objects representing the inline comments.
 */
export async function getInlineComments(): Promise<Todo[]> {
    const inlineComments: Todo[] = [];

    // Define the files to search (excluding common ignored directories)
    const files = await vscode.workspace.findFiles("**/*", "{**/node_modules/**,**/.git/**,**/.vscode/**}");

    // Comprehensive Regex: Matches comment start (//, #, --, /*, *) followed by 'TODO'.
    // (\/\/|#|--|\/\*|\*): Captures common single-line starts and block comment starts.
    // \s*: Optional whitespace.
    // TODO(:?): The keyword with an optional colon.
    // (.*): Captures the rest of the todo text.
    const todoRegex = /(\/\/|#|--|\/\*|\*)\s*TODO(:?)\s*(.*)/gi;

    // Process each file
    for (const file of files) {
        try {
            // Open the document to read its content
            const document = await vscode.workspace.openTextDocument(file);
            const text = document.getText();
            let match;

            // Iterate over all matches in the text
            while ((match = todoRegex.exec(text)) !== null) {
                // match[3] contains the captured todo text after 'TODO:'
                const todoText = match[3].trim();

                if (todoText) {
                    // Get the line number to provide context (for future use if needed)
                    const line = document.positionAt(match.index).line + 1;

                    // Create a Todo object. You'll need to define how to generate ID, date, etc.
                    const todo = createTodoObject(
                        todoText,
                        TodoColor.WHITE,
                        [],
                        file.path.split("/").pop() || "",
                        file.path,
                        line
                    );
                    inlineComments.push(todo);
                }
            }
        } catch (error) {
            console.error(`Error reading file ${file.fsPath}:`, error);
        }
    }

    return inlineComments;
}
