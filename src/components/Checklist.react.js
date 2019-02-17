import PropTypes from 'prop-types';
import {append, contains, without} from 'ramda';
import React, {Component} from 'react';

/**
 * Checklist is a component that encapsulates several checkboxes.
 * The values and labels of the checklist is specified in the `options`
 * property and the checked items are specified with the `values` property.
 * Each checkbox is rendered as an input with a surrounding label.
 */
export default class Checklist extends Component {
    constructor(props) {
        super(props);
        this.state = {values: props.values};
    }

    componentWillReceiveProps(newProps) {
        this.setState({values: newProps.values});
    }

    render() {
        const {
            className,
            id,
            inputClassName,
            inputStyle,
            labelClassName,
            labelStyle,
            options,
            spanCheckmarkClassName,
            spanCheckmarkStyle,
            spanLabelClassName,
            spanLabelStyle,
            setProps,
            style,
        } = this.props;
        const {values} = this.state;

        return (
            <div id={id} style={style} className={className}>
                {options.map(option => (
                    <label
                        key={option.value}
                        style={labelStyle}
                        className={labelClassName}
                    >
                        <span
                            key={option.value + '1'}
                            style={spanLabelStyle}
                            className={spanLabelClassName}
                        >
                            {option.label}
                        </span>
                        <input
                            checked={contains(option.value, values)}
                            className={inputClassName}
                            disabled={Boolean(option.disabled)}
                            style={inputStyle}
                            type="checkbox"
                            onChange={() => {
                                let newValues;
                                if (contains(option.value, values)) {
                                    newValues = without([option.value], values);
                                } else {
                                    newValues = append(option.value, values);
                                }
                                this.setState({values: newValues});
                                if (setProps) {
                                    setProps({values: newValues});
                                }
                            }}
                        />
                        <span
                            key={option.value + '2'}
                            style={spanCheckmarkStyle}
                            className={spanCheckmarkClassName}>
                        </span>
                    </label>
                ))}
            </div>
        );
    }
}

Checklist.propTypes = {
    id: PropTypes.string,

    /**
     * An array of options
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            /**
             * The checkbox's label
             */
            label: PropTypes.string,

            /**
             * The value of the checkbox. This value
             * corresponds to the items specified in the
             * `values` property.
             */
            value: PropTypes.string,

            /**
             * If true, this checkbox is disabled and can't be clicked on.
             */
            disabled: PropTypes.bool,
        })
    ),

    /**
     * The currently selected value
     */
    values: PropTypes.arrayOf(PropTypes.string),

    /**
     * The class of the container (div)
     */
    className: PropTypes.string,

    /**
     * The style of the container (div)
     */
    style: PropTypes.object,

    /**
     * The style of the <input> checkbox element
     */
    inputStyle: PropTypes.object,

    /**
     * The class of the <input> checkbox element
     */
    inputClassName: PropTypes.string,

    /**
     * The style of the <label> that wraps the checkbox input
     *  and the option's label
     */
    labelStyle: PropTypes.object,

    /**
     * The class of the <label> that wraps the checkbox input
     *  and the option's label
     */
    labelClassName: PropTypes.string,

    /**
     * The Style of the checkmark
     */
    spanCheckmarkStyle: PropTypes.object,

    /**
     * The class of the checkmark
     */
    spanCheckmarkClassName: PropTypes.string,

    /**
     * The style of the <span> that has the label
     */
    spanLabelStyle: PropTypes.object,

    /**
     * The class of the <span> that has the label
     */
    spanLabelClassName: PropTypes.string,

    /**
     * Dash-assigned callback that gets fired when the value changes.
     */
    setProps: PropTypes.func,
};

Checklist.defaultProps = {
    inputStyle: {},
    inputClassName: '',
    labelStyle: {},
    labelClassName: '',
    spanCheckmarkStyle: {},
    spanCheckmarkClassName: '',
    spanLabelStyle: {},
    spanLabelClassName: '',
    options: [],
};
