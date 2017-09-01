import React, { Component } from 'react';
import swaggerUI, { presets } from 'swagger-ui';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import 'swagger-ui/dist/swagger-ui.css';
import './theme-material.css'
import './SwaggerUI.css';


class SwaggerUI extends Component {

    constructor(props) {
        super(props);
        this.oasJsonUrl = '/oas/json';
        this.state = {
            reloaded: false
        };

        // Binding this to that
        this.handleClickReload = this.handleClickReload.bind(this);
    }
    componentDidMount() {
        swaggerUI({
            dom_id: '#oas-ui',
            url: '/oas/json',
            presets: [presets.apis],
        });
    }

    handleClickReload = () => {
        swaggerUI({
            dom_id: '#oas-ui',
            url: '/oas/json',
            presets: [presets.apis],
        });
        this.setState({
            reloaded: true
        })
    }
    render() {
        return <div id='swagger-ui-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Reload" primary={true} onClick={this.handleClickReload}/>
                </ToolbarGroup>
            </Toolbar>
            <div id='oas-ui'/>
        </div>;
    }
}

export default SwaggerUI;