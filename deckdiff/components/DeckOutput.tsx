import React from "react";
import {Deck} from "../types/Deck";
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
        if (sideboardOne.length > 0 && sideboardTwo.length > 0) {
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
        return (
            <ul>
                {list.map((name) => {
                    return (<li onMouseEnter={() => { this.loadImageUri(name); }}>
                        {name}
                    </li>);
                })}
            </ul>
        );
    }

    render() {

        const computeResult = this.compute();

        return (
            <div>
                {this.state.hoveredCardUri ? (
                    <img id={'hoveredCard'} src={this.state.hoveredCardUri} alt={"Current Card"} width={244} height={340}/>
                ) : null}

                <div className={"DeckOutput"}>
                    <div>
                        In Deck 1
                        {this.buildList(computeResult.inDeckOne)}
                        {(computeResult.inSideboardOne.length > 0 ? (<div>
                            In Sideboard
                            {this.buildList(computeResult.inSideboardOne)}
                        </div>) : null)}
                    </div>
                    <div>
                        In Deck 2
                        {this.buildList(computeResult.inDeckTwo)}
                        {computeResult.inSideboardTwo.length > 0 ? (<div>
                            In Sideboard
                            {this.buildList(computeResult.inSideboardTwo)}
                        </div>) : null}
                    </div>
                </div>
            </div>
        );
    }
}
