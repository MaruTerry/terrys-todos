# Terry's Todos README

Terry's Todos is a simple extension designed to help you to keep track of your todos 📝.\
The extension is meant to be a todo manager for one specific workspace. Therefore, each of your projects has its own todo list to boost your productivity and flexibility 📈.

➕ _NEW_ ➕\
**Automatic generation of commit messages based on the changes made in the workspace and the todos marked as done** 💡

To learn more about Terry's Tools [visit my marketplace page](https://marketplace.visualstudio.com/publishers/terrys-tools).

[To do list icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/to-do-list)<br>

## Features ✨

-   Create a new todo (ctrl + alt + T)

-   Manage existing todos in the side panel

    -   Create folders
    -   Highlight todos in different colors
    -   Sort todos by date or color
    -   Use Drag and Drop features

###

![alt text](/resources/TodoSidePanelSample.png)

###

-   Automatic generation of commit messages based on the changes made in the workspace and the todos marked as done. Simply press the 💡 icon on the top right of the source control side panel

###

![alt text](/resources/CommitMessageSample.png)

###

## Configuration ⚙️

Terry's Todos provides the following settings to customize its behavior:

-   `terrys-todos.includeDoneTodosOnce`:

    -   Type: `boolean`
    -   Default: `true`
    -   Description: Once a done todo was included in the generated commit message, it will not be included again.

-   `terrys-todos.deleteIncludedTodos`:
    -   Type: `boolean`
    -   Default: `false`
    -   Description: Once a done todo was included in the generated commit message, it will be permanently deleted.

\
**Enjoy!** 👏
