export enum DeckType {
    MTG_REGULAR = "M:tG Regular (60-card)",
    MTG_BRAWL = "M:tG Brawl",
    MTG_HISTORIC_BRAWL = "M:tG Historic 100-card Brawl",
}

export type DeckParameter = {
    readonly mainboardSize: number;
    readonly mainboardIsSizeExact: boolean;
    readonly sideboardSize: number;
}
export function getDeckParameters(type: DeckType): DeckParameter {
    switch (type) {
        case DeckType.MTG_REGULAR:
            return {
                mainboardSize: 60,
                mainboardIsSizeExact: false,
                sideboardSize: 15
            };
        case DeckType.MTG_BRAWL:
            return {
                mainboardSize: 59,
                mainboardIsSizeExact: true,
                sideboardSize: 0
            };
        case DeckType.MTG_HISTORIC_BRAWL:
            return {
                mainboardSize: 99,
                mainboardIsSizeExact: true,
                sideboardSize: 0
            };
        default:
            throw new Error("Invalid, unhandled DeckType: " + type);
    }
}
