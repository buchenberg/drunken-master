import React, { Component } from 'react';
import swaggerUI, { presets } from 'swagger-ui';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import 'swagger-ui/dist/swagger-ui.css';
import './theme-material.css'
import './SwaggerUI.css';


class SwaggerUI extends Component {

    constructor(props) {
        super(props);
        this.oasJsonUrl = '/api/oas/json';
        this.state = {
            loaded: false
        };

        // Binding this to that
        this.loadUi = this.loadUi.bind(this);
    }

    loadUi = () => {
        swaggerUI({
            dom_id: '#oas-ui',
            url: this.oasJsonUrl,
            presets: [presets.apis],
        });
        this.setState({
            loaded: true
        });
    };

    componentDidMount() {
        this.loadUi();
    }

    render() {
        return <div id='oas-ui-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Reload" primary={true} onClick={this.loadUi}/>
                </ToolbarGroup>
            </Toolbar>
            <div id='oas-ui'/>
        </div>;
    }
}

export default SwaggerUI;