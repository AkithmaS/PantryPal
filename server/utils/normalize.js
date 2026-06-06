export function normalize(value) {
    return String(value ?? '')
        .normalize('NFKD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}
