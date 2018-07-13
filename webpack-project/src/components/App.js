import React from 'react';
import Button from '@material-ui/core/Button';
import { hot } from 'react-hot-loader';
import Tabs from "./Tabs";
import {CssBaseline} from "@material-ui/core";
import Drawer from "./Drawer";

function App() {
    return (
        <div>
            <CssBaseline />
            <Tabs />
            <Drawer />
            <Button variant="raised" color="primary">
                Hello world!
            </Button>
        </div>
    );
}

export default hot(module)(App);