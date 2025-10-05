import * as vscode from "vscode";
import { createTodoObject, Todo } from "../interfaces/interfaces";
import { TodoColor } from "../interfaces/enums";

/**
 * Get all inline comments (// TODO: ...) from the current workspace.
 * @returns A promise with an array of Todo objects representing the inline comments.
 */
export async function getInlineComments(): Promise<Todo[]> {
    const inlineComments: Todo[] = [];

    // Search all files (**/*) but exclude common directories like node_modules, .git, etc.
    const files = await vscode.workspace.findFiles("**/*", "{**/node_modules/**,**/.git/**,**/.vscode/**}");

    // Pattern: Matches '//', followed by optional whitespace, 'TODO', optional colon,
    // optional whitespace, and captures the rest of the line.
    // It is case-insensitive (i), and applies to the whole line (g).
    const todoRegex = /(\/\/|\/\*|\*)\s*TODO(:?)\s*(.*)/gi;

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
