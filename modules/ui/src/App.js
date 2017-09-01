import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import SwaggerUI from './components/SwaggerUI/SwaggerUI';
import SwaggerEditor from './components/SwaggerEditor/SwaggerEditor';

import './App.css';


const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
};



class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>

          <AppBar title="Drunken Master"/>
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
            {/* <Tab label="Other stuff" data-route="/home">
              <div>
                More content here:
              </div>
            </Tab> */}
          </Tabs>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
