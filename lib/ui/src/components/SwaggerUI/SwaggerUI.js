import React, { Component } from 'react';
import swaggerUI, { presets } from 'swagger-ui';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import 'swagger-ui/dist/swagger-ui.css';
import './theme-material.css'
import './SwaggerUI.css';


class SwaggerUI extends Component {

    constructor(props) {
        super(props);
        let oasJsonUrl = props.spec;
        let key = `oas_ui_instance_${new Date().getTime().toString()}`;
        this.state = {
            key: key,
            loaded: false,
            oasJsonUrl
        };
    }

    loadUi = () => {
        swaggerUI({
            dom_id: `#${this.state.key}`,
            url: this.state.oasJsonUrl,
            presets: [presets.apis],
        });
        this.setState({
            loaded: true
        });
    };

    handleOasSelect = (event, child) => {
        console.log('select', child.props.value);
        this.setState({
            loaded: false,
            oasJsonUrl: child.props.value
        });
        this.loadUi();
    }

    componentDidMount() {
        this.loadUi();
    }

    render() {
        return <div id='oas-ui-wrapper'>
            <div id={this.state.key} />
        </div>;
    }
}

export default SwaggerUI;