import {LineFormat} from "./LineFormat";
import {Deck} from "./Deck";
import {MtgDeck} from "./MtgDeck";
import {MtgCommanderDeck} from "./MtgCommanderDeck";

/*
    When adding new enum values, update the two methods below
 */
export enum DeckType {
    MTG_REGULAR = "[M:tG] Regular (60-card)",
    MTG_BRAWL = "[M:tG] Brawl",
    MTG_COMMANDER = "[M:tG] Commander (100-card)",
    MTG_FREEFORM = "[M:tG] Freeform",
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
        case DeckType.MTG_COMMANDER:
            return {
                mainboardSize: 99,
                mainboardIsSizeExact: true,
                sideboardSize: 0
            }
        case DeckType.MTG_FREEFORM:
            return {
                mainboardSize: 0,
                mainboardIsSizeExact: false,
                sideboardSize: Number.MAX_SAFE_INTEGER
            }
        default:
            throw new Error("Invalid, unhandled DeckType: " + type);
    }
}

export function createNewDeck(deckType: DeckType, text: string, lineFormat: LineFormat): Deck {
    switch (deckType) {
        case DeckType.MTG_REGULAR:
        case DeckType.MTG_FREEFORM:
            return new MtgDeck(deckType, lineFormat).applyText(text);
        case DeckType.MTG_BRAWL:
        case DeckType.MTG_COMMANDER:
            return new MtgCommanderDeck(deckType, lineFormat).applyText(text);
        default:
            throw new Error("That deck type is not built out yet");
    }
}
