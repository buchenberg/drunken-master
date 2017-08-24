import React, { Component } from 'react';
import swaggerEditor, { plugins } from 'swagger-editor';
import swaggerUI from "swagger-ui";
import Yaml from "js-yaml";
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import './SwaggerEditor.css';
import 'swagger-editor/dist/swagger-editor.css';

class SwaggerEditor extends Component {

    constructor(props) {
        super(props);
        this.oasUrl = '/oas';
        this.oasJsonUrl = '/oas/json';
        this.oasYamlUrl = '/oas/yaml';
        this.routeUpdateUrl = '/server';
        this.state = {
            saved: false,
            revision: ''
        };
        // Binding this to that
        this.handleClickSave = this.handleClickSave.bind(this);
        this.handleClickReload = this.handleClickReload.bind(this);

        this.reroute = this.reroute.bind(this);
        this.loadEditor = this.loadEditor.bind(this);
    }

    componentDidMount() {
        fetch(this.oasUrl, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    revision: responseJson._rev
                });
            })
            .catch((error) => {
                console.error(error);
            });
        this.loadEditor();
    }

    loadEditor = () => {
        return swaggerEditor({
            dom_id: '#swagger-editor',
            url: this.oasYamlUrl,
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

    handleClickSave = () => {
        const content = localStorage.getItem('swagger-editor-content');

        const isJson = function (doc) {
            try {
                var json = JSON.parse(doc);
            } catch (e) {
                return false;
            }
            return true;
        };

        const bodyJson = function (doc) {
            if (isJson(doc)) {
                console.log('json found');
                return doc
            } else {
                console.log('yaml found');
                let jsonObj = Yaml.safeLoad(doc);
                let jsonStr = JSON.stringify(jsonObj);
                return jsonStr;
            }
        };

        //Save OAS spec
        fetch(this.oasUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyJson(content)
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    saved: true,
                    revision: responseJson.rev
                });
                this.reroute();
            })
            .catch((error) => {
                console.error(error);
            });

    }

    handleClickReload = () => {
        this.loadEditor();
    }

    reroute = () => {
        fetch(this.routeUpdateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    rerouted: true,
                    routes: responseJson.routes
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleSnackbarClose = () => {
        this.setState({
            saved: false,
            rerouted: false,
            routes: []
        });
    }

    render() {
        return <div id='swagger-editor-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Reload" primary={true} onClick={this.handleClickReload} />
                    <RaisedButton label="Save" primary={true} onClick={this.handleClickSave} />
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarTitle text="Revision" />
                    {this.state.revision}
                </ToolbarGroup>

            </Toolbar>
            <div id='swagger-editor' />
            <Snackbar
                open={this.state.saved}
                message={`OAS saved as revision ${this.state.revision}.`}
                autoHideDuration={4000}
                onRequestClose={this.handleSnackbarClose}
            />
        </div>;
    }
}

export default SwaggerEditor;