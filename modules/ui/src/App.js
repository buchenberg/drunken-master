import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { Tabs, Tab } from 'material-ui/Tabs';
// import RaisedButton from 'material-ui/RaisedButton';

import SwaggerUI from './components/SwaggerUI/SwaggerUI';
import SwaggerEditor from './components/SwaggerEditor/SwaggerEditor';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      navOpen: false
    };

    // Binding this to that
    this.toggleNav = this.toggleNav.bind(this);

  }

  toggleNav = () => this.setState({ navOpen: !this.state.navOpen });



  render() {
    return (
      <MuiThemeProvider>
        <div>

          <AppBar
            title="Drunken Master"
            onLeftIconButtonTouchTap={this.toggleNav} />
          <Drawer docked={false} open={this.state.navOpen}>
            <MenuItem onClick={this.toggleNav}>Home</MenuItem>
            <MenuItem onClick={this.toggleNav}>OAS Tools</MenuItem>
          </Drawer>
          <Tabs>
            <Tab label="OAS Editor" data-route="/home">
              <div>
                <SwaggerEditor></SwaggerEditor>
              </div>
            </Tab>
            <Tab label="OAS UI" data-route="/home">
              <div>
                <SwaggerUI></SwaggerUI>
              </div>
            </Tab>
            <Tab label="Status" data-route="/home">
              <div className="status-wrapper">
                <iframe title="status" src="/views/status"></iframe>
              </div>
            </Tab>
          </Tabs>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
