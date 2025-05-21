import React from "react";
import Collapsible from "react-collapsible";
import DeckInput from "./DeckInput";
import {DeckOutput} from "./DeckOutput";
import {EnumDropDown} from "./EnumDropDown";
import {LineFormat} from "../types/LineFormat";
import {createNewDeck, DeckType} from "../types/DeckType";
import {Deck} from "../types/Deck";
import {MtgDeck} from "../types/MtgDeck";

type PageState = {
    deckType: DeckType;
    deckOne: Deck;
    lineFormatOne: LineFormat;
    deckTwo: Deck;
    lineFormatTwo: LineFormat;
}

export class Page extends React.Component<any, PageState> {
    constructor() {
        super(undefined);
        this.state = {
            deckOne: new MtgDeck(DeckType.MTG_FREEFORM, LineFormat.BASIC),
            deckTwo: new MtgDeck(DeckType.MTG_FREEFORM, LineFormat.BASIC),
            deckType: DeckType.MTG_REGULAR,
            lineFormatOne: LineFormat.BASIC,
            lineFormatTwo: LineFormat.BASIC,
        };
    }

    render() {
        const { deckType, deckOne, lineFormatOne, deckTwo, lineFormatTwo } = this.state;
        //const deckOne = createNewDeck(deckType, textOne ?? "", lineFormatOne);
        //const deckTwo = createNewDeck(deckType, textTwo ?? "", lineFormatTwo);

        return (
            <div>
                <h1>
                    Hellooooo!
                </h1>

                <Collapsible trigger={"(+) Expand Deck input"} triggerWhenOpen={"(-) Collapse Deck input"} open={true}>
                    <div className={'mx-auto my-10 max-w-max'}>
                        <EnumDropDown<DeckType>
                            label={"Deck Format:"}
                            entries={Object.entries(DeckType)}
                            initialValue={DeckType.MTG_REGULAR}
                            onValueSelected={deckType => { this.setState({ deckType }); }} />
                    </div>

                    <div className={'flex flex-row items-start justify-evenly'}>
                        <DeckInput
                            deck={deckOne}
                            onDeckTextChanged={async (text: string): Promise<void> => {
                                // Async in case creating a deck needs to be await'd (for some reason)
                                const deck = createNewDeck(deckType, text ?? "", lineFormatOne);
                                this.setState({deckOne: deck})
                            }}
                            onLineFormatChanged={lineFormat => this.setState({lineFormatOne: lineFormat})}
                        />
                        <DeckInput
                            deck={deckTwo}
                            onDeckTextChanged={async (text: string) => {
                                // Async in case creating a deck needs to be await'd (for some reason)
                                const deck = createNewDeck(deckType, text ?? "", lineFormatTwo);
                                this.setState({deckTwo: deck});
                            }}
                            onLineFormatChanged={lineFormat => this.setState({lineFormatTwo: lineFormat})}
                        />
                    </div>
                </Collapsible>

                <DeckOutput deckOne={deckOne} deckTwo={deckTwo} deckType={deckType} />
            </div>
        );
    }
}
