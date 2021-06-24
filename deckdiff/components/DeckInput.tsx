import React, {ChangeEvent} from "react";
import {Deck} from "../types/Deck";

export type DeckInputProps = {
    onDeckTextChanged(text: string): void;
    deck: Deck;
}
type DeckInputState = {
}
export default class DeckInput extends React.Component<DeckInputProps, DeckInputState> {

    constructor(props: DeckInputProps) {
        super(props);
        this.state = {
            parsingErrors: []
        };
    }

    textChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        const newText = event.target.value;
        this.props.onDeckTextChanged(newText);
    }

    render() {
        const {deck} = this.props;

        const deckInfo = (<div>
            {`Mainboard size: `}
            <b>
                {deck.getNumCardsInMainboard()}
            </b>
            <span style={{marginRight: 20}} />
            {`Sideboard size: `}
            <b>
                {deck.getNumCardsInSideboard()}
            </b>
        </div>);

        const validationErrors = deck.validationErrors;

        const parsingErrorElements = validationErrors.length > 0 ?
            (<ul>
                {validationErrors.map((currError) => {
                    return (<li>{currError.message}</li>);
                })}
            </ul>) :
            <p>No Validation Errors</p>;

        return (
            <div className={'DeckInput'} style={{background: (validationErrors.length === 0) ? 'greenyellow' : 'indianred'}} >
                {deckInfo}
                <br />
                <textarea placeholder={'Enter a decklist'} onChange={this.textChanged.bind(this)} cols={45} rows={10} />

                {parsingErrorElements}
            </div>
        );
    }
}
