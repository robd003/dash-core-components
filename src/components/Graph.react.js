import React, {Component, PropTypes} from 'react';
import Plotly from 'plotly.js';
import {contains, filter, map, type} from 'ramda';

const filterEventData = (eventData, event) => {
    let filteredEventData;
    if (contains(event, ['click', 'hover', 'selected'])) {
        filteredEventData = {
            /*
             * remove `data`, `layout`, `xaxis`, etc
             * objects from the event data since they're so big
             * and cause JSON stringify ciricular structure errors.
             */
            points: eventData.points = map(
                filter(function(o) {
                    return !contains(type(o), ['Object', 'Array'])
             }), eventData.points)
        }
    } else if (event === 'relayout') {
        /*
         * relayout shouldn't include any big objects
         * it will usually just contain the ranges of the axes like
         * "xaxis.range[0]": 0.7715822247381828,
         * "xaxis.range[1]": 3.0095292008680063`
         */
        filteredEventData = eventData;
    }
    return filteredEventData;
};

export default class PlotlyGraph extends Component {
    constructor(props) {
        super(props);
        this.bindEvents = this.bindEvents.bind(this);
    }

    plot(props) {
        const {id, figure} = props;
        return Plotly.newPlot(id, figure).then(() => {
            this.bindEvents(props);
        });
    }

    bindEvents(props) {
        const {id, fireEvent, valueChanged} = props;

        // Get DOM node to call jQuery-provided `on` event binder.
        const gd = document.getElementById(id);

        gd.on('plotly_click', (eventData) => {
            const clickData = filterEventData(eventData, 'click');
            if (valueChanged) valueChanged({clickData});
            if (fireEvent) fireEvent({event: 'click'});
        });
        gd.on('plotly_hover', (eventData) => {
            const hoverData = filterEventData(eventData, 'hover');
            if (valueChanged) valueChanged({hoverData});
            if (fireEvent) fireEvent({event: 'hover'})
        });
        gd.on('plotly_selected', (eventData) => {
            const selectedData = filterEventData(eventData, 'selected');
            if (valueChanged) valueChanged({selectedData});
            if (fireEvent) fireEvent({event: 'selected'});
        });
        gd.on('plotly_relayout', (eventData) => {
            const relayoutData = filterEventData(eventData, 'relayout');
            if (valueChanged) valueChanged({relayoutData});
            if (fireEvent) fireEvent({event: 'relayout'});
        });
    }

    componentDidMount() {
        this.plot(this.props).then(() => {
            window.addEventListener('resize', () => {
                Plotly.Plots.resize(document.getElementById(this.props.id));
            });
        });
    }

    componentWillUnmount() {
        if (this.eventEmitter) {
            this.eventEmitter.removeAllListeners();
        }
    }

    shouldComponentUpdate() {
        // Never re-render after initialization, let Plotly.js own the DOM node.
        return false;
    }

    componentWillReceiveProps(nextProps) {
        // TODO optimize this check
        const figureChanged = JSON.stringify(this.props.figure) !== JSON.stringify(nextProps.figure)

        /*
         * Rebind events in case fireEvent or valueChanged
         * wasn't defined on initial render
         * TODO - Is it safe to rebind events?
         */
        const shouldBindEvents = (
            (!this.props.valueChanged && nextProps.valueChanged) ||
            (!this.props.fireEvent && nextProps.fireEvent)
        );
        if (figureChanged) {
            this.plot(nextProps);
        } else if (shouldBindEvents) {
            this.bindEvents(nextProps);
        }
    }

    render(){
        const {style, id} = this.props

        return (
            <div
                id={id}
                style={style}
            />
        );
    }
}

PlotlyGraph.propTypes = {
    /**
     * Data from latest click event
     */
    clickData: PropTypes.object,

    /**
     * Data from latest hover event
     */
    hoverData: PropTypes.object,

    /**
     * Data from latest select event
     */
    selectedData: PropTypes.object,

    /**
     * Data from latest zoom event
     */
    zoomData: PropTypes.object,

    /**
     * Plotly `figure` object. See schema:
     * https://plot.ly/javascript/reference
     */
    figure: PropTypes.object,

    /**
     * Generic style overrides on the plot div
     */
    style: PropTypes.object,

    /**
     * Function that updates the state tree.
     */
    valueChanged: PropTypes.func,

    /**
     * Function that fires events
     */
    fireEvent: PropTypes.func
}

PlotlyGraph.defaultProps = {
    clickData: null,
    hoverData: null,
    selectedData: null,
    zoomData: null,
    figure: {data: [], layout: {}},
    layout: {}
};