export enum LineFormat {
    BASIC = 'BASIC',
    ARENA_EXPORT = 'ARENA'
}

export function getLineFormatSample(lineFormat: LineFormat) {
    switch (lineFormat) {
        case LineFormat.BASIC:
            return `1 Black Lotus`;
        case LineFormat.ARENA_EXPORT:
            return `1 Black Lotus (LEA) 420`;
        default:
            return 'Format not fully built out yet'
    }
}
