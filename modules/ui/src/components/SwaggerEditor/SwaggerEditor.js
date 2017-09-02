import React, { Component } from 'react';
import swaggerEditor, { plugins } from 'swagger-editor';
import swaggerUI from "swagger-ui";
import Yaml from "js-yaml";
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import 'swagger-editor/dist/swagger-editor.css';
import './SwaggerEditor.css';



class SwaggerEditor extends Component {

    constructor(props) {
        super(props);
        this.oasUrl = '/dapi/oas';
        this.oasJsonUrl = '/dapi/oas/json';
        this.oasYamlUrl = '/dapi/oas/yaml';
        this.routeUpdateUrl = '/dapi/server';
        this.state = {
            oasExists: false,
            snackOpen: false,
            snackMessage: '',
            dialogOpen: false,
            uiOpen: true,
            dialogTitle: '',
            dialogMessage: ''
        };
        // Binding this to that
        this.handleClickSave = this.handleClickSave.bind(this);

        this.reroute = this.reroute.bind(this);
        this.loadEditor = this.loadEditor.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);

    }

    checkForOas() {
        fetch('/dapi/status', {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    oasExists: responseJson.oas
                });
            })
            .catch((error) => {
                console.error(error);
            });

    }

    getOas() {
        fetch(this.oasUrl, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.hasOwnProperty('_rev')) {
                    this.setState({
                        oasExists: true,
                        revision: responseJson._rev,
                        snackOpen: true,
                        snackMessage: `loaded rev ${responseJson._rev}`
                    });
                    this.loadEditor();
                } else {
                    this.setState({
                        oasExists: false,
                        dialogOpen: true,
                        dialogTitle: 'Error loading OpenAPI Specification',
                        dialogMessage: `There has been an error loading the specification from the database:\nMessage: ${responseJson.error}`
                    });
                }

            })
            .catch((error) => {
                this.setState({
                    oasExists: false,
                    dialogOpen: true,
                    dialogTitle: 'Error loading OpenAPI Specification',
                    dialogMessage: `There has been an error loading the specification from the database:\nMessage: ${error}`
                });
            });
    }

    componentDidMount() {
        this.getOas();
    }

    handleDialogClose = () => {
        this.setState({
            dialogOpen: false
        });
    };

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
                // eslint-disable-next-line 
                let json = JSON.parse(doc);
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
                    snackOpen: true,
                    revision: responseJson.rev,
                    snackMessage: `saved ${responseJson.rev}.`
                });
                this.reroute();
            })
            .catch((error) => {
                console.error(error);
            });

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
                    dialogOpen: true,
                    dialogTitle: 'Drunken Master has been rerouted.',
                    dialogMessage: <div>
                        <h3>Deleted routes:</h3>
                        <ul>
                            {responseJson.routes.deleted.map(function (element) {
                                return <li>{element.path}</li>;
                            })
                            }
                        </ul>
                        <h3>Added routes:</h3>
                        <ul>
                            {responseJson.routes.added.map(function (element) {
                                return <li>{element.path}</li>;
                            })
                            }
                        </ul>
                    </div>
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleSnackbarClose = () => {
        this.setState({
            snackOpen: false,
            rerouted: false
        });
    }

    render() {

        const actions = [
            <FlatButton
                label="OK"
                primary={true}
                onClick={this.handleDialogClose}
            />,
        ];

        const swaggerEditor = <div id='swagger-editor-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    <RaisedButton label="Save" primary={true} onClick={this.handleClickSave} />
                </ToolbarGroup>
            </Toolbar>

            <div id='swagger-editor' />

            <Dialog
                title={this.state.dialogTitle}
                actions={actions}
                modal={false}
                open={this.state.dialogOpen}
                onRequestClose={this.handleDialogClose}>
                {this.state.dialogMessage}
            </Dialog>

            <Snackbar
                open={this.state.snackOpen}
                message={this.state.snackMessage}
                autoHideDuration={4000}
                onRequestClose={this.handleSnackbarClose}
            />
        </div>;

        return swaggerEditor;
    }
}

export default SwaggerEditor;