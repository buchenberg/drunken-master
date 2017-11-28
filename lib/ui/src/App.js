import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import SwaggerUI from './components/SwaggerUI/SwaggerUI';
import DreddUI from './components/DreddUI/DreddUI';


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
            showMenuIconButton={false}
          />
          <div>
                <SwaggerUI></SwaggerUI>
          </div>
          {/* <Tabs>
            <Tab label="OAS UI" data-route="/home">
              <div>
                <SwaggerUI></SwaggerUI>
              </div>
            </Tab>
            <Tab label="Dredd UI" data-route="/dredd">
              <div>
                <DreddUI></DreddUI>
              </div>
            </Tab>
            <Tab label="Status Monitor" data-route="/status">
              <div className="status-wrapper">
                <iframe title="status" src="/views/status"></iframe>
              </div>
            </Tab> 
          </Tabs> */}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
