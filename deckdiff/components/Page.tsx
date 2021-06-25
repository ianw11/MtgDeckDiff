import React from "react";
import Collapsible from "react-collapsible";
import DeckInput from "./DeckInput";
import {Deck} from "../types/Deck";
import {DeckOutput} from "./DeckOutput";
import {MtgDeck} from "../types/MtgDeck";
import {MtgCommanderDeck} from "../types/MtgCommanderDeck";
import {EnumDropDown} from "./EnumDropDown";
import {LineFormat} from "../types/LineFormat";
import {DeckType} from "../types/DeckType";

type PageState = {
    deckType: DeckType;
    textOne?: string;
    lineFormatOne: LineFormat;
    textTwo? : string;
    lineFormatTwo: LineFormat;
}
export class Page extends React.Component<any, PageState> {
    constructor() {
        super(undefined);
        this.state = {
            deckType: DeckType.MTG_REGULAR,
            lineFormatOne: LineFormat.BASIC,
            lineFormatTwo: LineFormat.BASIC,
        };
    }

    private createNewDeck(text: string, lineFormat: LineFormat): Deck {
        const deckType = this.state.deckType;
        let deck: Deck;
        switch (deckType) {
            case DeckType.MTG_REGULAR:
                deck = new MtgDeck(deckType, lineFormat);
                break;
            case DeckType.MTG_BRAWL:
            case DeckType.MTG_HISTORIC_BRAWL:
                deck = new MtgCommanderDeck(deckType, lineFormat);
                break;
            default:
                throw new Error("That deck type is not built out yet");
        }

        deck.applyText(text);
        return deck;
    }

    render() {
        const { textOne, lineFormatOne, textTwo, lineFormatTwo } = this.state;
        const deckOne = this.createNewDeck(textOne ?? "", lineFormatOne);
        const deckTwo = this.createNewDeck(textTwo ?? "", lineFormatTwo);

        return (
            <div>
                <h1>
                    Hellooooo!
                </h1>

                <Collapsible trigger={"(+) Expand Deck input"} triggerWhenOpen={"(-) Collapse Deck input"} open={true}>
                    <div id={'formatSelectContainer'}>
                        <EnumDropDown
                            label={"Deck Format:"}
                            entries={Object.entries(DeckType)}
                            initialValue={DeckType.MTG_REGULAR}
                            onValueSelected={deckType => { this.setState({ deckType }); }} />
                    </div>

                    <div id={'deckInputContainer'}>
                        <DeckInput deck={deckOne}
                                   onDeckTextChanged={(text: string) => this.setState({textOne: text})}
                                   onLineFormatChanged={lineFormat => this.setState({lineFormatOne: lineFormat})}/>
                        <DeckInput deck={deckTwo}
                                   onDeckTextChanged={(text: string) => this.setState({textTwo: text})}
                                   onLineFormatChanged={lineFormat => this.setState({lineFormatTwo: lineFormat})} />
                    </div>
                </Collapsible>

                <DeckOutput deckOne={deckOne} deckTwo={deckTwo} />
            </div>
        );
    }
}
