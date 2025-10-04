/**
 * Formats a Date object into a string in the format "DD.MM.YYYY".
 *
 * @param string - The date to format.
 * @return A string representing the formatted date.
 */
export function formatDate(date: string): string {
    const dateObj = new Date(date);
    return `${dateObj.getDate()}.${dateObj.getMonth() + 1}.${dateObj.getFullYear()}`;
}
