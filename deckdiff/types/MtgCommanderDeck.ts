import {MtgDeck} from "./MtgDeck";
import {CardAndQuantity} from "./CardAndQuantity";
import {ComparisonError, Deck, ValidationError} from "./Deck";
import {LineFormat} from "./LineFormat";
import {DeckType} from "./DeckType";

export class MtgCommanderDeck extends MtgDeck {
    private commander?: CardAndQuantity;
    private nextLineIsCommander = false;

    constructor(type: DeckType, lineFormat: LineFormat) {
        super(type, lineFormat);
    }

    override processLine(line: string): ValidationError | undefined {
        if (line == 'Commander') {
            this.nextLineIsCommander = true;
            return;
        }
        if (this.nextLineIsCommander) {
            this.nextLineIsCommander = false;

            const data = this.parseMagicCardLine(line);
            if (!data) {
                return {message: "Unable to parse Commander from: " + line};
            }
            if (typeof data === 'string') {
                return {message: data};
            }
            if (data.quantity !== 1) {
                return {message: "Invalid quantity for Commander: " + data.quantity};
            }
            this.commander = new CardAndQuantity({name: data.name, types: [], cardSet: data.set}, 1);
            return;
        }
        return super.processLine(line);
    }

    getCommander(): CardAndQuantity | undefined {
        return this.commander;
    }

    protected validateSelf(): ValidationError[] {
        const errors = super.validateSelf();

        if (this.commander === undefined) {
            errors.push({message: 'Commander not found; expected a Commander'});
        }

        return errors;
    }

    override compareAgainst(other: Deck): ComparisonError[] {

        const comparisonErrors = [];

        // Ensure the other deck is a Commander Deck
        if (!(other instanceof MtgCommanderDeck)) {
            comparisonErrors.push({message: 'Cannot compare Decks - wrong type (non-Commander)'});
        } else {
            const otherCommander = other.commander;
            // Ensure the other Commander Deck has a Commander and it matches the Commander from this deck
            if (this.commander !== undefined && otherCommander !== undefined && otherCommander.name !== this.commander.name) {
                comparisonErrors.push({message: 'Commanders do not match'});
            }
        }

        const errors = super.compareAgainst(other);
        if (comparisonErrors.length > 0) {
            errors.push({
                listName: 'Commander',
                comparisonValidationErrors: comparisonErrors
            });
        }
        return errors;
    }
}
