import React, { Component } from 'react';
import swaggerEditor from 'swagger-editor';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import './SwaggerEditor.css';
import 'swagger-editor/dist/swagger-editor.css';





class SwaggerEditor extends Component {
    componentDidMount() {
        swaggerEditor({
            dom_id: '#swagger-editor',
            url: '/oas',
            layout: 'EditorLayout'
        })
    }
    constructor(props) {
        super(props);
        this.state = {
            value: 3,
        };
    }

    handleClickSave(event, index, value) {
        console.log('save clicked');
    };

    handleClickReload(event, index, value) {
        console.log('reload clicked');
    };
    

    render() {
        return <div id='swagger-editor-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Save" primary={true} onClick={this.handleClickSave}/>
                    <RaisedButton label="Reload" onClick={this.handleClickReload} />
                </ToolbarGroup>
            </Toolbar>
            <div id='swagger-editor' />
        </div>;
    }
}

export default SwaggerEditor;