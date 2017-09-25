import React, { Component } from 'react';
import Yaml from "js-yaml";
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import socketIOClient from "socket.io-client";
import './StatusMonitor.css';

const socket = socketIOClient("http://127.0.0.1:9999");


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
            connections: 0,
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

    emitSomething = (msg) => {
        socket.emit('client message', msg)
    }

    componentDidMount() {
        this.getOasStatus();
        socket.on("revision", data => {
            console.log('Got a new revision from socket.io')
            this.setState({ revision: data });
        });
        socket.on("dynamic_routes", data => {
            console.log('got a route update.', data)
            this.setState({ dynamic_routes: data });
        });
        socket.on("connections", data => {
            this.setState({ connections: data });
        });
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
                        <CardTitle title="Server Status" />
                        <CardText>
                            <p>
                                Connections: {this.state.connections}
                            </p>
                            {this.state.oas ? (
                                <p>
                                    OAS revision {this.state.revision} loaded.
                                </p>
                            ) : (
                                <p>
                                    OAS revision {this.state.revision} loaded.
                                </p>
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
                    </Card>
                </div>
            </div>;

        return statusMonitor;
    }
}

export default StatusMonitor;