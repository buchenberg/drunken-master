import React, { Component } from 'react';
import swaggerEditor, { plugins } from 'swagger-editor';
import swaggerUI from "swagger-ui";
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import './SwaggerEditor.css';
import 'swagger-editor/dist/swagger-editor.css';





class SwaggerEditor extends Component {

    editor = null;

    componentDidMount() {
        const editor = swaggerEditor({
            dom_id: '#swagger-editor',
            url: 'http://localhost:9999/oas',
            layout: 'EditorLayout',
            presets: [
                swaggerUI.presets.apis
            ],
            plugins: [
                plugins.EditorPlugin,
                plugins.ValidationPlugin,
                plugins.ValidationApiPlugin,
                plugins.LocalStoragePlugin,
                plugins.EditorAutosuggestPlugin,
                plugins.EditorAutosuggestSnippetsPlugin,
                plugins.EditorAutosuggestKeywordsPlugin,
                plugins.EditorAutosuggestRefsPlugin,
                plugins.EditorAutosuggestOAS3KeywordsPlugin,
            ],
            // components: {
            //     EditorLayout
            //   }
        })
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleClickSave(event, index, value) {
        console.log('spec', localStorage.getItem('swagger-editor-content'));
    };

    handleClickReload(event, index, value) {
        console.log('reload clicked');
    };


    render() {
        return <div id='swagger-editor-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Save" primary={true} onClick={this.handleClickSave} />
                    <RaisedButton label="Reload" onClick={this.handleClickReload} />
                </ToolbarGroup>
            </Toolbar>
            <div id='swagger-editor' />
        </div>;
    }
}

export default SwaggerEditor;