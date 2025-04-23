export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')                     // Tách chữ và dấu
        .replace(/[\u0300-\u036f]/g, '')     // Loại bỏ dấu
        .replace(/[^\p{L}\p{N}\s-]/gu, '')   // Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số, khoảng trắng, dấu -
        .replace(/[\s_-]+/g, '-')             // Thay khoảng trắng, dấu _ hoặc - thành dấu -
        .replace(/^-+|-+$/g, '');             // Loại bỏ dấu - thừa ở đầu và cuối
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
