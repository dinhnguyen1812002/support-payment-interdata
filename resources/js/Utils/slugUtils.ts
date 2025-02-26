export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with dashes
        .replace(/^-+|-+$/g, '');   // Remove leading or trailing dashes
}

export function uppercaseText(text :string):string {
    return text.toUpperCase();
}
export function extractPublic(arr: string[]) {
    const str = arr[0]; // Lấy chuỗi từ mảng
    const publicChars = ['p', 'u', 'b', 'l', 'i', 'c'];
    const inputArray = str.split('');

    const result = [];
    for (let char of publicChars) {
        const index = inputArray.indexOf(char);
        uppercaseText(char);
        if (index !== -1) {
            result.push(char);
            inputArray.splice(index, 1);

        } else {
            return "Không thể tạo từ 'public' từ chuỗi này.";
        }
    }

    return result.join('');
}
