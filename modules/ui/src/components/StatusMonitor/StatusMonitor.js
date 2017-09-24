import React, { Component } from 'react';
import Yaml from "js-yaml";
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import './StatusMonitor.css';



class StatusMonitor extends Component {

    constructor(props) {
        super(props);
        this.oasStatusUrl = '/api/status';
        this.oasUrl = '/api/oas';
        this.oasJsonUrl = '/api/oas/json';
        this.oasYamlUrl = '/api/oas/yaml';
        this.state = {
            oas: false,
            revision: '',
            static_routes: [],
            dynamic_routes: [],

        };

    }

    getOasStatus = () => {
        fetch(this.oasStatusUrl, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    oas: responseJson.oas,
                    revision: responseJson.revision,
                    static_routes: responseJson.routes.static,
                    dynamic_routes: responseJson.routes.dynamic
                });
            })
            .catch((error) => {
                console.error(error);
            });

    }

    componentDidMount() {
        this.getOasStatus();
    }

    render() {

        const statusMonitor =
            <div id='status-monitor-wrapper'>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <RaisedButton label="Load" primary={true} onClick={this.getOasStatus} />
                    </ToolbarGroup>
                </Toolbar>

                <div id='status-monitor'>
                    <Card>
                        <CardTitle title="OAS Status" />
                        <CardText>
                            {this.state.oas ? (
                                <h3>
                                    Revision {this.state.revision} loaded.
                                </h3>
                            ) : (
                                <h3>
                                    Revision {this.state.revision} loaded.
                                </h3>
                                )}
                        </CardText>
                    </Card>
                    <Card>
                        <CardTitle title="Routes" />
                        <CardText>
                            <h2>Static Routes</h2>
                            {this.state.static_routes.map((route, index) => (
                                <p key={index}>{route.method} {route.path}</p>
                            ))}
                            <br></br>
                            <h2>Dynamic Routes</h2>
                            {this.state.dynamic_routes.map((route, index) => (
                                <p key={index}>{route.method} {route.path}</p>
                            ))}
                        </CardText>
                        <CardActions>
                            <FlatButton label="Action1" />
                            <FlatButton label="Action2" />
                        </CardActions>
                    </Card>
                </div>
            </div>;

        return statusMonitor;
    }
}

export default StatusMonitor;