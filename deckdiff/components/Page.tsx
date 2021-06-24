import React from "react";
import Collapsible from "react-collapsible";
import DeckInput from "./DeckInput";
import {Deck, DeckType} from "../types/Deck";
import {DeckOutput} from "./DeckOutput";
import {MtgDeck} from "../types/MtgDeck";
import {MtgCommanderDeck} from "../types/MtgCommanderDeck";

type PageState = {
    deckType: DeckType;
    textOne?: string;
    textTwo? : string;
}
export class Page extends React.Component<any, PageState> {
    constructor() {
        super(undefined);
        this.state = {
            deckType: DeckType.MTG_STANDARD
        };
    }

    deckTypeSelected(deckType: DeckType) {
        this.setState({ deckType: deckType });
    }

    private createNewDeck(text?: string): Deck {
        const deckType = this.state.deckType;
        let deck: Deck;
        switch (deckType) {
            case DeckType.MTG_STANDARD:
                deck = new MtgDeck(deckType);
                break;
            case DeckType.MTG_BRAWL:
            case DeckType.MTG_HISTORIC_BRAWL:
                deck = new MtgCommanderDeck(deckType);
                break;
            default:
                throw new Error("That deck type is not built out yet");
        }

        text = text ?? "";
        deck.applyText(text);
        return deck;
    }

    render() {
        const {textOne, textTwo} = this.state;
        const deckOne = this.createNewDeck(textOne);
        const deckTwo = this.createNewDeck(textTwo);

        return (
            <div>
                <h1>
                    Hellooooo!
                </h1>

                <div className='horizontal'>
                    <Collapsible trigger={"(+) Expand Deck input"} triggerWhenOpen={"(-) Collapse Deck input"} open={true}>
                        <div id={'formatRadioButtonContainer'}>
                            {Object.entries(DeckType).map((entry) => {
                                const [label, value] = entry;
                                return (<span className={'FormatRadioButton'}>
                                    <input type="radio" value={label} id={label} name={"deckSelector"} onChange={(event) => {
                                        // onChange only fires when selected
                                        this.deckTypeSelected(value);
                                    }} checked={value === this.state.deckType} />
                                    <label htmlFor={label}>
                                        <b>{value}</b>
                                    </label>
                                </span>);
                            })}
                        </div>
                        <div id={'inputContainer'}>
                            <DeckInput deck={deckOne} onDeckTextChanged={(text: string) => { this.setState({textOne: text}); }}/>
                            <DeckInput deck={deckTwo} onDeckTextChanged={(text: string) => { this.setState({textTwo: text}); }}/>
                        </div>
                    </Collapsible>
                </div>

                <DeckOutput deckOne={deckOne} deckTwo={deckTwo} />
            </div>
        );
    }
}
