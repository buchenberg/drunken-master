import React, { Component } from 'react';
import swaggerEditor, { plugins } from 'swagger-editor';
import swaggerUI from "swagger-ui";
import Yaml from "js-yaml";
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dead from 'mui-icons/cmdi/emoticon-dead';
import ToggleRight from 'mui-icons/fontawesome/toggle-right';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import 'swagger-editor/dist/swagger-editor.css';
import styles from './SwaggerEditor.css';
// import 'swagger-editor/dist/swagger-editor.css';



class SwaggerEditor extends Component {

    constructor(props) {
        super(props);
        this.oasUrl = '/oas';
        this.oasJsonUrl = '/oas/json';
        this.oasYamlUrl = '/oas/yaml';
        this.routeUpdateUrl = '/server';
        this.state = {
            oasExists: false,
            saved: false,
            revision: '',
            dialogOpen: false,
            uiOpen: true,
            dialogTitle: '',
            dialogMessage: ''
        };
        // Binding this to that
        this.handleClickSave = this.handleClickSave.bind(this);
        this.handleClickReload = this.handleClickReload.bind(this);

        this.reroute = this.reroute.bind(this);
        this.loadEditor = this.loadEditor.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);
        this.handleToggleRight = this.handleToggleRight.bind(this);
        this.handleToggleLeft = this.handleToggleLeft.bind(this);

    }

    checkForOas() {
        fetch('/status', {
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
                        revision: responseJson._rev
                    });
                    this.loadEditor();
                } else {
                    this.setState({
                        oasExists: false,
                        dialogOpen: true,
                        dialogTitle: 'Error retrieving OAS!',
                        dialogMessage: responseJson.error
                    });
                }

            })
            .catch((error) => {
                this.setState({
                    oasExists: false,
                    dialogOpen: true,
                    dialogTitle: 'Error retrieving OAS!',
                    dialogMessage: error
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

    handleToggleRight = () => {
        this.setState({
            uiOpen: false
        });
    };

    handleToggleLeft = () => {
        this.setState({
            uiOpen: true
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
            saved: false,
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
        return <div id='swagger-editor-wrapper'>
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                    {/* <RaisedButton label="Reload" primary={true} onClick={this.handleClickReload} /> */}
                    <RaisedButton label="Save" primary={true} onClick={this.handleClickSave} />
                </ToolbarGroup>
                <ToolbarGroup>
                    Revision: {this.state.revision}
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
                open={this.state.saved}
                message={`Saved ${this.state.revision}.`}
                autoHideDuration={4000}
                onRequestClose={this.handleSnackbarClose}
            />
        </div>;
    }
}

export default SwaggerEditor;