import React, {ChangeEvent, TextareaHTMLAttributes} from "react";
import {Deck, ValidationError} from "../types/Deck";
import {EnumDropDown} from "./EnumDropDown";
import {getLineFormatSample, LineFormat} from "../types/LineFormat";
import {NECTARSAC_FULL_URL} from "../Constants";

type RobitResponse = {
    event?: string;
    deckTitle?: string;
    decklist: string[];
    sideboard: string[];
};

export type DeckInputProps = {
    onDeckTextChanged(text: string): void;
    onLineFormatChanged(lineFormat: LineFormat): void;
    deck: Deck;
}
type DeckInputState = {
    decklist: string;
}
export default class DeckInput extends React.Component<DeckInputProps, DeckInputState> {

    constructor(props: DeckInputProps) {
        super(props);
        this.state = {
            decklist: '',
        };
    }


    private textChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        const newText = event.target.value;
        this.props.onDeckTextChanged(newText);
    }

    private async urlChanged(event: ChangeEvent<HTMLTextAreaElement>) {
        const url = event.target.value;

        (event.target.previousSibling as HTMLInputElement).value = '';

        let fullString = '';
        if (url) {
            try {
                const response = await fetch(NECTARSAC_FULL_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({url}),
                });

                const {event, deckTitle, decklist, sideboard} = await response.json() as RobitResponse;

                fullString = decklist.join('\n') + (sideboard.length > 0 ? ('\nSideboard\n' + sideboard.join('\n')) : '');
            } catch (e) {
                console.error(e);
            }
        }

        this.props.onDeckTextChanged(fullString);

        this.setState({
            decklist: fullString,
        });
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

        const { decklist } = this.state;

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

                <FillableTextArea
                    placeholder={'Enter a decklist'}
                    onChange={this.textChanged.bind(this)}
                    cols={45} rows={10}
                    textToFill={decklist}
                />

                <textarea
                    placeholder={'Enter an mtgtop8 url'}
                    onChange={this.urlChanged.bind(this)}
                    cols={30}
                    rows={1}
                    style={{marginTop: 8}}
                />

                {deckInfo}

                {parsingErrorElements}
            </div>
        );
    }
}

const FillableTextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement> & { textToFill: string; }): React.ReactElement => {
    return (
        <textarea
            {...props}
            disabled={props.textToFill.length > 0}
            value={ props.textToFill === '' ? undefined : props.textToFill }
        />
    );
}
