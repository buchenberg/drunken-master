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
import StatusMonitor from './components/StatusMonitor/StatusMonitor';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>

          <AppBar
            title="Drunken Master"
            showMenuIconButton={false}/>
          <Tabs>
            <Tab label="OAS Editor" data-route="/home">
              <div>
                <SwaggerEditor />
              </div>
            </Tab>
            <Tab label="OAS UI" data-route="/home">
              <div>
                <SwaggerUI/>
              </div>
            </Tab>
            <Tab label="Status Monitor" data-route="/home">
              <div>
                <StatusMonitor/>
              </div>
            </Tab>
          </Tabs>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
