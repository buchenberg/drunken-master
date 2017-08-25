import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import SwaggerUI from './components/SwaggerUI/SwaggerUI';
import SwaggerEditor from './components/SwaggerEditor/SwaggerEditor';
import RouteList from './components/Routelist/RouteList';

import './App.css';

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>

          <AppBar title="Drunken Master"/>
          <Tabs>
            <Tab label="Swagger Editor" data-route="/editor">
              <div>
                <SwaggerEditor/>
              </div>
            </Tab>
            <Tab label="Swagger UI" data-route="/viewer">
              <div>
                <SwaggerUI/>
              </div>
            </Tab>
            <Tab label="Other stuff" data-route="/routes">
              <div>
                <RouteList/>
              </div>
            </Tab>
          </Tabs>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
