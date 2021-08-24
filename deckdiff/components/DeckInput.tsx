import React, {ChangeEvent} from "react";
import {Deck, ValidationError} from "../types/Deck";
import {EnumDropDown} from "./EnumDropDown";
import {getLineFormatSample, LineFormat} from "../types/LineFormat";

export type DeckInputProps = {
    onDeckTextChanged(text: string): void;
    onLineFormatChanged(lineFormat: LineFormat): void;
    deck: Deck;
}
export default class DeckInput extends React.Component<DeckInputProps, any> {

    private textChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        const newText = event.target.value;
        this.props.onDeckTextChanged(newText);
    }

    private buildDeckInfo(deck: Deck) {
        return (<div>
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
    }

    private buildDeckValidationErrors(validationErrors: ValidationError[]) {
        return (validationErrors.length > 0) ?
            (<ul>
                {validationErrors.map((currError, ndx) => {
                    return (<li key={ndx}> {currError.message} </li>);
                })}
            </ul>) :
            (<p>
                No Validation Errors
            </p>);
    }

    render() {
        const {deck} = this.props;
        const {validationErrors} = deck;

        const deckInfo = this.buildDeckInfo(deck);
        const parsingErrorElements = this.buildDeckValidationErrors(validationErrors);

        return (
            <div className={'flex-auto flex flex-col justify-evenly rounded-md p-8 m-5'}
                 style={{background: (validationErrors.length === 0) ? 'greenyellow' : 'indianred'}} >
                <span style={{margin: "auto"}}>
                    <EnumDropDown<LineFormat>
                        label={"Export Format:"}
                        exampleText={getLineFormatSample}
                        initialValue={LineFormat.BASIC}
                        entries={Object.entries(LineFormat)}
                        onValueSelected={(lineFormat) => this.props.onLineFormatChanged(lineFormat) } />
                </span>

                <br />

                <textarea placeholder={'Enter a decklist'} onChange={this.textChanged.bind(this)} cols={45} rows={10} />

                {deckInfo}

                {parsingErrorElements}
            </div>
        );
    }
}
