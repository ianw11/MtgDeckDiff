import React, {ChangeEvent} from "react";
import {Deck, DeckType} from "../types/Deck";
import {MtgDeck} from "../types/MtgDeck";
import {MtgCommanderDeck} from "../types/MtgCommanderDeck";

export type DeckInputProps = {
    deckType: DeckType;
    onNewDeck(deck?: Deck): void;
}
type DeckInputState = {
    text?: string;
    deck?: Deck;
    parsingErrors: string[];
}
export default class DeckInput extends React.Component<DeckInputProps, DeckInputState> {

    constructor(props: DeckInputProps) {
        super(props);
        this.state = {
            parsingErrors: []
        };
    }

    shouldComponentUpdate(nextProps: Readonly<DeckInputProps>, nextState: Readonly<DeckInputState>, nextContext: any): boolean {
        const oldType = this.props.deckType;
        const newType = nextProps.deckType;
        const {text: oldText, deck: oldDeck} = this.state;
        const {text: newText, deck: newDeck} = nextState;
        if (oldType === newType && oldText === newText && oldDeck?.timestamp === newDeck?.timestamp) {
            return false;
        }
        return true;
    }

    componentDidUpdate(prevProps: Readonly<DeckInputProps>, prevState: Readonly<DeckInputState>, snapshot?: any) {
        if (prevProps.deckType !== this.props.deckType || prevState.text !== this.state.text) {
            this.rebuildDeck();
            return;
        }
        const newDeck = this.state.deck;
        console.log("Reporting new deck");
        this.props.onNewDeck(newDeck?.validateDeck() ? newDeck : undefined);
    }

    private rebuildDeck() {
        const errors: string[] = [];

        let deck: Deck | undefined;
        switch(this.props.deckType) {
            case DeckType.MTG_STANDARD:
                deck = new MtgDeck(this.props.deckType);
                break;
            case DeckType.MTG_BRAWL:
            case DeckType.MTG_HISTORIC_BRAWL:
                deck = new MtgCommanderDeck(this.props.deckType);
                break;
            default:
                errors.push('Deck type is not built out yet...');
                break;
        }

        if (deck) {
            const text = this.state.text ?? "";
            text.split("\n").forEach((line) => {
                const errorMsg = deck?.processLine(line);
                if (errorMsg) {
                    errors.push(errorMsg);
                }
            });
        }

        this.setState({
            deck: deck,
            parsingErrors: errors
        });
    }

    textChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        const newText = event.target.value;
        this.setState({
            text: newText
        });
    }

    render() {
        const {deck, parsingErrors} = this.state;

        const deckInfo = deck === undefined ? null :
            (<div>
                {`Mainboard size: ${deck.getNumCardsInMainboard()} out of ${deck.parameters.mainboardSize} ${deck.parameters.mainboardIsSizeExact ? "EXACTLY" : "MINIMUM"}`}
                <br />
                {`Sideboard size: ${deck.getNumCardsInSideboard()} out of ${deck.parameters.sideboardSize} MAXIMUM`}
            </div>);

        const parsingErrorElements = parsingErrors.length > 0 ?
            (<ul>
                {parsingErrors.map((currError) => {
                    return (<li>{currError}</li>);
                })}
            </ul>) :
            <p>No Validation Errors</p>;

        return (
            <div className={'DeckInput'} style={{background: deck?.validateDeck() ? 'green' : 'red'}} >
                <h3>Paste the deck here:</h3>
                <textarea onChange={this.textChanged.bind(this)} cols={45} rows={10} />
                <br />
                {deckInfo}
                <br />
                {parsingErrorElements}
            </div>
        );
    }
}
