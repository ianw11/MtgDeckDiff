import {ComparisonError, Deck, ValidationError} from "./Deck";
import {CardAndQuantity, MtGCardType} from "./CardAndQuantity";
import {LineFormat} from "./LineFormat";
import {DeckType} from "./DeckType";
import {Card, Cards} from "scryfall-api";

type MagicCardData = {
    quantity: number;
    name: string;
    set?: string;
    cardId?: string;
}

export class MtgDeck extends Deck {

    readonly lineFormat: LineFormat;

    private inAboutSection = false;

    private inMainboard = true;

    private companion?: CardAndQuantity;
    private companionNextLine = false;

    constructor(type: DeckType, lineFormat: LineFormat) {
        super(type);
        this.lineFormat = lineFormat;
    }

    override processLine(line: string): ValidationError | undefined {
        const data = this.parseMagicCardLine(line);
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            return {message: data.replaceAll("%LINE%", line)};
        }
        const {name, quantity, set} = data;
        if (this.shouldSkipCard(name)) {
            return;
        }


        //console.log(`Requesting card name ${name} from Scryfall`);
        //const scryfallCard = await this.lookUpCardOnScryfall(name);
        //const types = this.buildTypesArrayFromScryfallCard(scryfallCard);
        //console.log(types);
        const card = new CardAndQuantity(
            {
                name,
                types: [],
                cardSet: set
            }, quantity);

        if (this.companionNextLine) {
            this.companionNextLine = false;
            this.companion = card;
            return;
        }
        if (this.inMainboard) {
            this.addToMainboard(card);
        } else {
            if (this.companion === undefined || this.companion.name !== card.name) {
                this.addToSideboard(card);
            }
        }
    }

    // If a string is returned, that's an error message
    // Otherwise it should return a Magic Card + quantity ( + setId + cardId... if we ever get there)
    protected parseMagicCardLine(line: string): string | MagicCardData | undefined {
        if (line === 'About') {
            this.inAboutSection = true;
            return;
        }
        if (this.inAboutSection) {
            if (line.length === 0) {
                this.inAboutSection = false;
            } else {
                // if (line.startsWith("Name')) { parse the name}
                // No-op
            }
            return;
        }

        if (line === 'Deck' || line.length === 0) {
            return;
        }
        if (line === 'Commander') {
            return "Found Commander in non-Commander deck list";
        }
        if (line === 'Companion') {
            this.companionNextLine = true;
            return;
        }
        if (line.toLocaleLowerCase().startsWith('sideboard')) {
            console.log(`Line flipping to sideboard: ${line}`);
            this.inMainboard = false;
            return;
        }

        const split = line.split(" ");

        switch (this.lineFormat) {
            case LineFormat.ARENA_EXPORT:
                return this.parseArenaLine(split);
            case LineFormat.BASIC:
                return this.parseBasicLine(split);
            default:
                throw new Error("Unknown line format");
        }
    }

    private parseArenaLine(split: string[]): string | MagicCardData | undefined {
        if (split.length < 4) {
            return "Line did not split into 4 or more segments: %LINE%";
        }

        const cardIdStr = split.pop();
        const setStr = split.pop();

        const basicData = this.parseBasicLine(split);
        if (typeof basicData === 'string') {
            return basicData;
        }
        return { ...basicData, set: setStr, cardId: cardIdStr };
    }

    private parseBasicLine(split: string[]): string | MagicCardData {
        const quantity = this.getQuantity(split);
        if (typeof quantity === "string") {
            return quantity;
        }

        const name = split.join(" ");

        return { quantity, name };
    }

    private getQuantity(split: string[]): string | number {
        if (split.length < 2) {
            return "Line did not split into 2 or more segments: %LINE%";
        }
        const quantityStr = split.shift() ?? "0";
        const quantity = parseInt(quantityStr);
        if (isNaN(quantity) || quantity < 1) {
            return "Invalid quantity for line: %LINE%";
        }
        return quantity;
    }

    private shouldSkipCard(cardName: string): boolean {
        // All lower-case
        cardName = cardName.toLocaleLowerCase();

        return cardName.startsWith('token: ') ||
            cardName.startsWith('emblem: ') ||
            cardName === 'clue' ||
            cardName === 'orc army' ||
            cardName === 'on an adventure'
    }

    override compareAgainst(other: Deck): ComparisonError[] {
        const companionErrors: ValidationError[] = [];

        if (! (other instanceof MtgDeck)) {
            companionErrors.push({message: 'Cannot compare Decks - wrong type (non-MtG)'})
        } else {
            const otherCompanion = other.companion;
            if (otherCompanion !== undefined) {
                if (this.companion === undefined) {
                    companionErrors.push({message: 'This deck does not have a Companion', severity: "WARN"})
                } else if (this.companion.name !== otherCompanion.name) {
                    companionErrors.push({message: 'Companions do not match'});
                }
            }
        }

        const errors = super.compareAgainst(other);
        if (companionErrors.length > 0) {
            errors.push({
                listName: 'Companion',
                comparisonValidationErrors: companionErrors
            });
        }
        return errors;
    }

    protected async lookUpCardOnScryfall(cardName: string): Promise<Card> {
        const card = await Cards.byName(cardName);
        if (!card) {
            throw new Error(`Could not load card ${cardName}`);
        }

        return card;
    }

    private buildTypesArrayFromScryfallCard(card: Card): MtGCardType[] {
        return card.type_line.split('//')[0]
            .split(' — ')[0]
            .split(' ')
            .map(type => type.toLocaleUpperCase())
            .filter(type => !!type) as MtGCardType[];
    }
}
