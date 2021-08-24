import React, {ChangeEvent} from "react";

export interface EnumDropDownProps<T> {
    label?: string;
    entries: [string, T][];
    initialValue: T;
    onValueSelected(value: T): void;
    exampleText?(value: T): string;
}
type EnumDropDownState<T> = {
    value: T;
}
export class EnumDropDown<T extends string> extends React.Component<EnumDropDownProps<T>, EnumDropDownState<T>> {

    constructor(props: EnumDropDownProps<T>) {
        super(props);
        this.state = { value: this.props.initialValue };
    }

    private onSelect(event: ChangeEvent<HTMLSelectElement>) {
        const value: T = event.currentTarget.value as T;
        this.props.onValueSelected(value);
        this.setState({ value });
    }

    render() {
        const options = this.props.entries.map(entry => {
            const [label, name] = entry;
            return (
                <option value={name} key={label} className={'EnumDropDownOption'} >
                    {name}
                </option>
            );
        });

        return (
            <div className={'EnumDropDown'}>
                {this.props.label ? (
                    <span className={'EnumDropDownLabel'}>
                        {this.props.label}
                    </span>
                ) : null}

                <select className={'EnumDropDownSelect'}
                        defaultValue={this.props.initialValue}
                        onChange={(event) => { this.onSelect(event); }} >
                    {options}
                </select>

                {(this.props.exampleText === undefined) ? null :
                    (<div style={{margin: '5px auto', width: 'fit-content'}}>
                        Example: <b>"{this.props.exampleText(this.state.value)}"</b>
                    </div>)
                }
            </div>
        );
    }
}
