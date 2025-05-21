import React, {ReactElement} from "react";
import {ComparisonError, Deck} from "../types/Deck";
import {DeckType} from "../types/DeckType";
import {diff_match_patch, DIFF_EQUAL, DIFF_DELETE} from "../diff_match_patch";

type DiffCompute = {
    inDeckOne: CardName[];
    inDeckTwo: CardName[];
    inSideboardOne: CardName[];
    inSideboardTwo: CardName[];
}

export type DeckOutputProps = {
    deckOne: Deck;
    deckTwo: Deck;
    deckType: DeckType;
}
type DeckOutputState = {
    hoveredCardName?: string;
    hoveredCardUri?: string;
}
interface CardName {
    name?: string;
    displayName: string;
}

export class DeckOutput extends React.Component<DeckOutputProps, DeckOutputState> {

    constructor(props: DeckOutputProps) {
        super(props);
        this.state = {};
    }

    private diffLines(first: string, second: string) {
        const dmp = new diff_match_patch() as any;
        const data = dmp.diff_linesToChars_(first, second);
        const diffs = dmp.diff_main(data.chars1, data.chars2, false);
        dmp.diff_charsToLines_(diffs, data.lineArray);
        return diffs;
    }

    private buildCardName(rawName: string): CardName {
        const lastOpen = rawName.lastIndexOf("(");
        const name = lastOpen === -1 ? rawName : rawName.substring(0, lastOpen).trim();
        return {
            name,
            displayName: rawName
        };
    }

    private compute(): DiffCompute {
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
                    compute.inDeckOne.push(this.buildCardName(name));
                } else {
                    compute.inDeckTwo.push(this.buildCardName(name));
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
                        compute.inSideboardOne.push(this.buildCardName(name));
                    } else {
                        compute.inSideboardTwo.push(this.buildCardName(name));
                    }
                });
            });
        }

        return compute;
    }

    private async loadImageUri(name?: string) {
        if (name === undefined || name === this.state.hoveredCardName) {
            return;
        }

        const responseRaw = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
        const response = await responseRaw.json();

        if (response.object === 'error') {
            const {code, type, status, details} = response;
            console.error(`Failed to load image. code: ${code} || details: ${details}`);
            return;
        }

        let image_uris = response.image_uris;
        if (!image_uris) {
            if (!response.card_faces) {
                console.error("Could not find a card...");
                console.log(response);
                return;
            }
            image_uris = response.card_faces[0].image_uris;
            if (!image_uris) {
                console.error("Did not receive uri in: " + JSON.stringify(response));
                return;
            }
        }

        this.setState({
            hoveredCardName: name,
            hoveredCardUri: image_uris.normal
        });
    }

    private buildList(list: CardName[], listName: string, onMouseHover?: ((name?: string)=>void) ) {
        // We can get away with this because a Plains is ALWAYS named Plains
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
            'Wastes': 0,
        };

        // The main list

        const listItems = list.map((cardName, ndx) => {
            const {name, displayName} = cardName;
            if (name !== undefined && basicLandCounts[name] !== undefined) {
                ++basicLandCounts[name];
                return;
            }

            // eslint-disable-next-line react/jsx-key
            return (<span className={'FreeFloatingListItem'}>
                <b key={`${name}${ndx}`} onMouseEnter={() => {
                    if (onMouseHover !== undefined) {
                        onMouseHover(name);
                    }
                }}>
                    {displayName}
                </b>
            </span>);
        }).filter(item => item !== undefined);

        let numDiffs = listItems.length;

        // The special case for basic lands

        Object.entries(basicLandCounts).forEach((entry) => {
            const [landName, count] = entry;
            if (count === 0) {
                return;
            }

            numDiffs += count;
            listItems.push(<span className={'FreeFloatingListItem'}>
                <b key={`${landName}${count}`} onMouseEnter={() => {
                    if (onMouseHover !== undefined) {
                        onMouseHover(landName);
                    }
                }}>
                    {count}x {landName}
                </b>
            </span>);
        });

        return (
            <div style={{marginBottom: 20}}>
                <span style={{display: 'flex', flexDirection: 'column'}}>
                    <span style={{textDecoration: 'underline', fontWeight: 'bold', color: 'darkred'}}>{listName}</span>
                    <span style={{fontSize: 11, color: 'white'}}>Total differences: {numDiffs}</span>
                </span>

                <span style={{display: 'flex', flexDirection: 'column'}}>
                    {listItems}
                </span>
            </div>
        );
    }

    private buildDeckComparisonOutput(deckList: CardName[], sideboardList: CardName[], comparisonErrors: ComparisonError[]) {
        const comparisonLists = comparisonErrors.map(comparisonError => {
            const { listName, comparisonValidationErrors } = comparisonError;
            if (comparisonValidationErrors.length === 0) {
                return;
            }
            const errorList = comparisonValidationErrors.map(vError => ({displayName: vError.message}));
            return this.buildList(errorList, listName);
        }).filter(elem => elem !== undefined);

        return deckList.length === 0 && sideboardList.length === 0 ? (<div />) :
            (<div className={'bg-gray-400 DeckComparison'}>

            {comparisonLists}

            {
                deckList.length === 0 ? null :
                    this.buildList(deckList, 'Mainboard', (name) => this.loadImageUri(name))
            }

            {
                sideboardList.length === 0 ? null :
                    this.buildList(sideboardList, 'Sideboard', (name) => this.loadImageUri(name))
            }

        </div>);
    }

    private buildCardPreview(cardUri?: string): ReactElement {
        return (<div style={{width: '25%'}}> { cardUri ?
            <img id={'hoveredCard'} src={this.state.hoveredCardUri} alt={"Current Card"} /> :
            <span /> }
        </div>);
    }

    render() {
        const { deckOne, deckTwo } = this.props;
        const { inDeckOne, inSideboardOne, inDeckTwo, inSideboardTwo } = this.compute();

        return (
            <div>
                {inDeckOne.length > 0 && inDeckTwo.length > 0 ? (
                    <div style={{margin: "10px auto", width: 'fit-content', fontSize: 16}}>(Hover over the card names!)</div>
                ) : null}

                <div className={"flex-auto flex flex-row justify-evenly mt-10"}>

                    {this.buildDeckComparisonOutput(inDeckOne, inSideboardOne, deckOne.compareAgainst(deckTwo))}

                    {this.buildCardPreview(this.state.hoveredCardUri)}

                    {this.buildDeckComparisonOutput(inDeckTwo, inSideboardTwo, deckTwo.compareAgainst(deckOne))}

                </div>
            </div>
        );
    }
}
