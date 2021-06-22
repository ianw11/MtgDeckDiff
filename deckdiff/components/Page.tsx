import React, {FormEvent} from "react";
import Collapsible from "react-collapsible";
import DeckInput from "./DeckInput";
import {Deck, DeckType} from "../types/Deck";
import {DeckOutput} from "./DeckOutput";

type PageState = {
    deckType: DeckType;
    deckOne?: Deck;
    deckTwo?: Deck;
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

    setDeckOne(deck?: Deck) {
        console.log("Received new deck 1. Is defined? " + (deck !== undefined));
        this.setState({ deckOne: deck });
    }
    setDeckTwo(deck?: Deck) {
        console.log("Received new deck 2. Is defined? " + (deck !== undefined));
        this.setState({ deckTwo: deck });
    }

    render() {
        return (
            <div>
                <h1>
                    Hellooooo!
                </h1>

                <div>
                    <h2>First: Choose the Deck's Format</h2>
                    {Object.entries(DeckType).map((entry) => {
                        const [label, value] = entry;
                        return [
                            <input type="radio" value={label} id={label} name={"deckSelector"} onChange={(event) => {
                                // onChange only fires when selected
                                this.deckTypeSelected(value);
                            }} checked={value === this.state.deckType} />,
                            <label htmlFor={label}>
                                {value}
                            </label>,
                            <br />
                        ];
                    })}
                </div>

                <h2>Second: Paste your (exported) deck lists</h2>
                <div className='horizontal'>
                    <Collapsible trigger={"(+) Click to expand Deck input"} triggerWhenOpen={"(-) Click to collapse Deck input"} open={true}>
                        <DeckInput deckType={this.state.deckType} onNewDeck={(deck) => this.setDeckOne(deck) }/>
                        <DeckInput deckType={this.state.deckType} onNewDeck={(deck) => this.setDeckTwo(deck) }/>
                    </Collapsible>
                </div>

                {(this.state.deckOne && this.state.deckTwo) ? <DeckOutput deckOne={this.state.deckOne} deckTwo={this.state.deckTwo} /> : null}
            </div>
        );
    }
}
