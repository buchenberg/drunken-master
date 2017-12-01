import React, { Component } from 'react';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';
import Drawer from 'material-ui/Drawer';
import SwaggerUI from './components/SwaggerUI/SwaggerUI';
import DreddUI from './components/DreddUI/DreddUI';

import './App.css';

var fileContent = require("./out.md");


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
      oasSelected: false,
      selectedOas: '',
      oasList: []
    };

  };

  componentDidMount() {
    fetch('/oas', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache': 'no-cache'
      }
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          oasList: responseJson
        })
        return;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleMenuClick = (event, child) => {
    this.setState({
      drawerOpen: true
    });
  };

  handleOasSelect = (event, value) => {
    this.setState({
      drawerOpen: false,
      oasSelected: true,
      selectedOas: value,
    });
  };



  render() {
    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title="Drunken Master"
            onLeftIconButtonTouchTap={this.handleMenuClick}
          />
          < Drawer open={this.state.drawerOpen}>
            <Menu onChange={this.handleOasSelect}>
              {this.state.oasList.map(function (spec, index) {
                return <MenuItem key={'oas_mi_' + index} value={spec.path} primaryText={spec.title} />;
              })}
            </Menu>
          </Drawer>
          <Tabs>
            {this.state.oasSelected ? (
              <Tab label="OAS UI" data-route="/home">
                <div key={this.state.selectedOas}>
                  <SwaggerUI spec={this.state.selectedOas}></SwaggerUI>
                </div>
              </Tab>
            ) : (
                <Tab label="OAS UI" data-route="/home">
                  <div>
                    <h2>Select OAS from the menu.</h2>
                  </div>
                </Tab>
              )}
            <Tab label="Dredd UI" data-route="/dredd">
              <div>
                <DreddUI></DreddUI>
              </div>
            </Tab>
          </Tabs>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
