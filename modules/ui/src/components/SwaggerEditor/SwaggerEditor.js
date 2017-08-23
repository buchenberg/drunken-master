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
        this.oasUrl = '/oas';
        this.routeUpdateUrl = '/server';
        this.state = {
            saved: false,
            rerouted: false,
            routes: [],
            revision: ''
        };

        // Binding this to that
        this.handleClickSave = this.handleClickSave.bind(this);
        this.handleClickReload = this.handleClickReload.bind(this);
    }


    handleClickSave = () => {
        const content = localStorage.getItem('swagger-editor-content');

        // const isYaml = function (doc) {
        //     try {
        //         var yaml = Yaml.safeLoad(doc);
        //         console.log(doc);
        //         return true;
        //     } catch (e) {
        //         console.log(e);
        //         return false;
        //     }
        // };
        // const bodyJson = function (doc) {
        //     if (isYaml(doc)) {
        //         console.log('yaml found');
        //         return Yaml.safeLoad(doc)
        //     } else {
        //         console.log('json found');
        //         return doc
        //     }
        // };

        fetch(this.oasUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    saved: true,
                    revision: responseJson.rev
                });
            })
            .catch((error) => {
                console.error(error);
            });

    };

    handleClickReload = () => {
        //TODO make url var
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
    };

    handleSnackbarClose = () => {
        this.setState({
            saved: false,
            rerouted: false,
            routes: []
        });
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
            <Snackbar
                open={this.state.saved}
                message={ `OAS saved as revision ${this.state.revision}.` }
                autoHideDuration={4000}
                onRequestClose={this.handleSnackbarClose}
            />
            <Snackbar
                open={this.state.rerouted}
                message="Drunken Master has been rerouted."
                autoHideDuration={4000}
                onRequestClose={this.handleSnackbarClose}
            />
        </div>;
    }
}

export default SwaggerEditor;