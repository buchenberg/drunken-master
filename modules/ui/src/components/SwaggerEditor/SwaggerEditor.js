import React, { Component } from 'react';
import swaggerEditor, { plugins } from 'swagger-editor';
import swaggerUI from "swagger-ui";
import Yaml from "js-yaml";
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import './SwaggerEditor.css';
import 'swagger-editor/dist/swagger-editor.css';





class SwaggerEditor extends Component {


    componentDidMount() {
        swaggerEditor({
            dom_id: '#swagger-editor',
            url: this.oasUrl,
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
            ]
        })
    }

    constructor(props) {
        super(props);
        this.oasUrl = 'http://localhost:9999/oas'
        this.state = {
        };
    }

    isYaml(doc){
        try {
            var yaml = Yaml.safeLoad(doc);
            console.log(doc);
            return true;
          } catch (e) {
            console.log(e);
            return false;
          }
    }
    

    handleClickSave(event, index, value) {
        const self = this;
        const content = localStorage.getItem('swagger-editor-content');

        const isYaml = function (doc){
            try {
                var yaml = Yaml.safeLoad(doc);
                console.log(doc);
                return true;
              } catch (e) {
                console.log(e);
                return false;
              }
        };
        const bodyJson = function (doc) {
            if (isYaml(doc)) {
                console.log('yaml found');
                return Yaml.safeLoad(doc) 
            } else {
                console.log('json found');
                return doc
            }
        };
        
        
        //TODO make url var
        fetch( 'http://localhost:9999/oas', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content
        })
        .then((response) => response.json())
        .then((responseJson) => {
          alert(Yaml.safeDump(responseJson));
        })
        .catch((error) => {
          console.error(error);
        });
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