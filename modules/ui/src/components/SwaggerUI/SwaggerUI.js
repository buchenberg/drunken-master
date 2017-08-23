import React, { Component } from 'react';
import swaggerUI, { presets } from 'swagger-ui';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import 'swagger-ui/dist/swagger-ui.css';
import './SwaggerUI.css';


class SwaggerUI extends Component {
    componentDidMount() {
        swaggerUI({
            dom_id: '#swagger-ui',
            url: 'http://localhost:9999/oas',
            presets: [presets.apis],
        });
    }
    render() {
        return <div id='swagger-ui-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Reload" primary={true} onClick={this.handleClick}/>
                </ToolbarGroup>
            </Toolbar>
            <div id='swagger-ui' />
        </div>;
    }
}

export default SwaggerUI;