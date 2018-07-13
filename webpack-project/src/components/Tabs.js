import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Table from "./Table";
import {hot} from "react-hot-loader";
import ExpansionPanels from "./ExpansionPanels";
import TextFields from "./TextFields";
import Chart from "./Chart";

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
});

class SimpleTabs extends React.Component {
    state = {
        value: 0,
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs value={value} onChange={this.handleChange}>
                        <Tab label="Table" />
                        <Tab label="Expansion panels" />
                        <Tab label="Text inputs" href="#basic-tabs" />
                        <Tab label="Chart" href="#basic-tabs" />
                    </Tabs>
                </AppBar>
                {value === 0 && <TabContainer><Table /></TabContainer>}
                {value === 1 && <TabContainer><ExpansionPanels /></TabContainer>}
                {value === 2 && <TabContainer><TextFields /></TabContainer>}
                {value === 3 && <TabContainer><Chart /></TabContainer>}
            </div>
        );
    }
}

SimpleTabs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default hot(module)(withStyles(styles)(SimpleTabs));