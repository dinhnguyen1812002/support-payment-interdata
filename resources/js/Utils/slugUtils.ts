export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with dashes
        .replace(/^-+|-+$/g, '');   // Remove leading or trailing dashes
}
