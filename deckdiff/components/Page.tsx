import React from "react";
import Collapsible from "react-collapsible";
import DeckInput from "./DeckInput";
import {DeckOutput} from "./DeckOutput";
import {EnumDropDown} from "./EnumDropDown";
import {LineFormat} from "../types/LineFormat";
import {createNewDeck, DeckType} from "../types/DeckType";

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

    render() {
        const { deckType, textOne, lineFormatOne, textTwo, lineFormatTwo } = this.state;
        const deckOne = createNewDeck(deckType,textOne ?? "", lineFormatOne);
        const deckTwo = createNewDeck(deckType,textTwo ?? "", lineFormatTwo);

        return (
            <div>
                <h1>
                    Hellooooo!
                </h1>

                <Collapsible trigger={"(+) Expand Deck input"} triggerWhenOpen={"(-) Collapse Deck input"} open={true}>
                    <div className={'mx-auto my-10 max-w-max'}>
                        <EnumDropDown
                            label={"Deck Format:"}
                            entries={Object.entries(DeckType)}
                            initialValue={DeckType.MTG_REGULAR}
                            onValueSelected={deckType => { this.setState({ deckType }); }} />
                    </div>

                    <div className={'flex flex-row items-start justify-evenly'}>
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
