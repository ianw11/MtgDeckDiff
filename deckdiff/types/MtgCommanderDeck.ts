import {MtgDeck} from "./MtgDeck";
import {CardAndQuantity} from "./CardAndQuantity";
import {DeckType} from "./Deck";

export class MtgCommanderDeck extends MtgDeck {
    commander?: CardAndQuantity;

    constructor(type: DeckType) {
        super(type);
    }

    processLine(line: string): string | undefined {
        if (line === 'Commander') {
            if (this.commander !== undefined) {
                return "Already found commander, duplicated title"
            }
            return;
        }
        if (this.commander === undefined) {
            const data = this.parseMagicCardLine(line);
            if (!data) {
                return;
            }
            if (typeof data === 'string') {
                throw new Error(data);
            }
            this.commander = new CardAndQuantity(data.name);
            return;
        }
        return super.processLine(line);
    }
}
