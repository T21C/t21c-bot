export const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const encryptText = (content, secretKey) => {
    const data: any = Array.from(content)
    const key: any = Array.from(secretKey)
    for (let i = 0; i < data.length; i++) {
        data[i] = String.fromCharCode(
            data[i].charCodeAt(0) ^ key[i % key.length].charCodeAt(0)
        )
    }
    return data.join('')
}

export const convertFromPUA = (str: string) => {
    const SPECIAL_CHAR_MAP = {
        '*': '\uE000', // Asterisk
        '%': '\uE001', // Percent
        '+': '\uE002', // Plus
        '-': '\uE003', // Minus
        '&': '\uE004', // Ampersand
        '|': '\uE005', // Vertical bar
        '!': '\uE006', // Exclamation mark
        '(': '\uE007', // Opening parenthesis
        ')': '\uE008', // Closing parenthesis
        '{': '\uE009', // Opening brace
        '}': '\uE00A', // Closing brace
        '[': '\uE00B', // Opening bracket
        ']': '\uE00C', // Closing bracket
        '^': '\uE00D', // Caret
        '"': '\uE00E', // Double quote
        '~': '\uE00F', // Tilde
        ':': '\uE010', // Colon
        ' ': '\uE011', // Space
        '`': '\uE012', // Backtick
        '=': '\uE013', // Equals sign
        '<': '\uE014', // Less than
        '>': '\uE015', // Greater than
        '?': '\uE016', // Question mark
        '/': '\uE017', // Slash
        '\\': '\uE018' // Backslash
    }

    const reverseMap = Object.fromEntries(
        Object.entries(SPECIAL_CHAR_MAP).map(([normal, pua]) => [pua, normal])
    ) as Record<string, string>

    return Array.from(str)
        .map((ch) => reverseMap[ch] ?? ch)
        .join('')
}
