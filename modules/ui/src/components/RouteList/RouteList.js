import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import './RouteList.css';

class RouteList extends Component {

    constructor(props) {
        super(props);
        this.routeUrl = '/routes'
        this.state = {
            routes: []
        };
    }

    componentDidMount() {
        fetch(this.routeUrl, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    routes: responseJson
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }




    render() {
        return <div id='routes-wrapper'>
            
            <Toolbar>
                <ToolbarGroup firstChild={true}>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarTitle text="Revision" />
                    {this.state.revision}
                </ToolbarGroup>
            </Toolbar>
            <List>
                {this.state.routes.map(route => <ListItem primaryText={route.path} />)}
            </List>
        </div>;
    }
}

export default RouteList;