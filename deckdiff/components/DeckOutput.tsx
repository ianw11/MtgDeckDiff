import React from "react";
import {Deck} from "../types/Deck";
import {CardAndQuantity} from "../types/CardAndQuantity";
const diff_match_patch_lib = require("../diff_match_patch");
const {diff_match_patch, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT} = diff_match_patch_lib;

type DiffCompute = {
    inDeckOne: string[];
    inDeckTwo: string[];
    inSideboardOne: string[];
    inSideboardTwo: string[];
}

export type DeckOutputProps = {
    deckOne: Deck;
    deckTwo: Deck;
}
type DeckOutputState = {
    hoveredCardUri?: string;
}
export class DeckOutput extends React.Component<DeckOutputProps, DeckOutputState> {

    constructor(props: DeckOutputProps) {
        super(props);
        this.state = {};
    }

    diffLines(first: string, second: string) {
        const dmp = new diff_match_patch();
        const data = dmp.diff_linesToChars_(first, second);
        const diffs = dmp.diff_main(data.chars1, data.chars2, false);
        dmp.diff_charsToLines_(diffs, data.lineArray);
        return diffs;
    }

    compute(): DiffCompute {
        const compute: DiffCompute = {
            inDeckOne: [],
            inDeckTwo: [],
            inSideboardOne: [],
            inSideboardTwo: []
        };

        const mainboardOne = this.props.deckOne.mainboardToString();
        const mainboardTwo = this.props.deckTwo.mainboardToString();
        const result = this.diffLines(mainboardOne, mainboardTwo);

        result.forEach((DIFF: any) => {
            const operation = DIFF[0];
            if (operation === DIFF_EQUAL) {
                return;
            }
            // const operationName = operation === DIFF_DELETE ? "DELETE" : "INSERT";
            const text = DIFF[1].split("\n");
            text.forEach((name: string) => {
                if (name === "") {
                    return;
                }
                if (operation === DIFF_DELETE) {
                    compute.inDeckOne.push(name);
                } else {
                    compute.inDeckTwo.push(name);
                }
            });
        });

        const sideboardOne = this.props.deckOne.sideboardToString();
        const sideboardTwo = this.props.deckTwo.sideboardToString();
        if (sideboardOne.length > 0 || sideboardTwo.length > 0) {
            const sideboardResult = this.diffLines(sideboardOne, sideboardTwo);

            sideboardResult.forEach((DIFF: any) => {
                const operation = DIFF[0];
                if (operation === DIFF_EQUAL) {
                    return;
                }
                // const operationName = operation === DIFF_DELETE ? "DELETE" : "INSERT";
                const text = DIFF[1].split("\n");
                text.forEach((name: string) => {
                    if (name === "") {
                        return;
                    }
                    if (operation === DIFF_DELETE) {
                        compute.inSideboardOne.push(name);
                    } else {
                        compute.inSideboardTwo.push(name);
                    }
                });
            });
        }

        return compute;
    }

    async loadImageUri(name: string) {
        const responseRaw = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${name}`);
        const response = await responseRaw.json();

        let image_uris = response.image_uris;
        if (!image_uris) {
            image_uris = response.card_faces[0].image_uris;
            if (!image_uris) {
                console.error("Did not receive uri in: " + JSON.stringify(response));
                return;
            }
        }

        this.setState({
            hoveredCardUri: image_uris.normal
        });
    }

    buildList(list: string[]) {
        // We can get away with this because a Plains is ALWAYS a Plains
        const basicLandCounts: Record<string, number> = {
            'Plains': 0,
            'Island': 0,
            'Swamp': 0,
            'Mountain': 0,
            'Forest': 0,
            'Snow-Covered Plains': 0,
            'Snow-Covered Island': 0,
            'Snow-Covered Swamp': 0,
            'Snow-Covered Mountain': 0,
            'Snow-Covered Forest': 0,
        };

        const listItems = list.map((name) => {
            if (basicLandCounts[name] !== undefined) {
                ++basicLandCounts[name];
                return;
            }
            return (<li onMouseEnter={() => { this.loadImageUri(name); }}>
                {name}
            </li>);
        });

        Object.entries(basicLandCounts).forEach((entry) => {
            const [name, count] = entry;
            if (count === 0) {
                return;
            }
            listItems.push(<li onMouseEnter={() => { this.loadImageUri(name) }}>
                {count}x {name}
            </li>);
        });

        return (
            <ul>
                {listItems}
            </ul>
        );
    }

    private buildDeckComparisonOutput(deckList: string[], sideboardList: string[]) {
        // Returns an empty div to maintain spacing (in the flexbox)
        return deckList.length === 0 ? <div /> : (
            (<div className={'DeckComparison'}>

                {this.buildList(deckList)}
                {sideboardList.length === 0 ? null :
                    (<div>
                        <br />
                        {this.buildList(sideboardList)}
                    </div>)
                }
            </div>)
        );
    }

    render() {

        const computeResult = this.compute();

        const imageWidth = 244;
        const imageHeight = 340;

        return (
            <div className={"DeckOutput"}>
                {this.buildDeckComparisonOutput(computeResult.inDeckOne, computeResult.inSideboardOne)}
                {this.state.hoveredCardUri ? (
                    <img id={'hoveredCard'} src={this.state.hoveredCardUri} alt={"Current Card"} width={imageWidth} height={imageHeight}/>
                ) : <span style={{marginRight: imageWidth}} />}
                {this.buildDeckComparisonOutput(computeResult.inDeckTwo, computeResult.inSideboardTwo)}
            </div>
        );
    }
}
