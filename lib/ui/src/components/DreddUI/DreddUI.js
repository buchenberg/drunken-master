import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import socketIOClient from "socket.io-client";
import './DreddUI.css';


const style = {
  margin: 12,
  customWidth: {
    width: 150,
  },
};


const endpoint = "/";
const socket = socketIOClient(endpoint);

class DreddUI extends Component {

  constructor(props) {
    super(props);

    const accounts = [];
    const progress = {};

    this.state = {
      reportRun: false,
      reportRunning: false,
      stats: {},
      dredd_server: '',
      dredd_path: '',
      dredd_level: 1
    };

    // Binding this to that
    this.runReport = this.runReport.bind(this);

  }

  // componentDidMount() {
  //   fetch('/dredd', {
  //     method: 'GET',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //       'Cache': 'no-cache'
  //     },
  //     credentials: 'include'
  //   })
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       this.setState({
  //         dredd_config: responseJson
  //       })
  //       return;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }

  // handleSubmit = (event) => {
  //   event.preventDefault();
  //   var formData = {
  //     server: React.findDOMNode(this.refs.server).value,
  //     options: {
  //       path: [
  //         React.findDOMNode(this.refs.path).value
  //       ],
  //       level: React.findDOMNode(this.refs.level).value,
  //     }
  //   };
  //   this.setState({ type: 'info', message: 'Sending...' }, this.sendFormData);
  // }

  runReport = (event) => {
    event.preventDefault();
    const loggingLevel = function (index) {
      switch (index) {
        case 1:
          return 'info'
          break;
        case 2:
          return 'debug'
          break;
        default:
          return 'info'
      }
    }

    const dredd_config = {
      server: this.state.dredd_server,
      options: {
        path: [
          this.state.dredd_path
        ],
        level: loggingLevel(this.state.dredd_level),
      }
    }
    this.setState({
      reportRunning: true
    });
    console.log('dredd_config', dredd_config)
    fetch('/api/dredd', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache': 'no-cache'
      },
      body: JSON.stringify(dredd_config),
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          stats: responseJson,
          reportRunning: false,
          reportRun: true
        })
        return;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleSelectLevel = (event, index, value) => this.setState({ dredd_level: value });


  render() {
    return (
        <div>
          <Card style={style}>
            <CardTitle title="Dredd Runner" />
            <CardText>
              <div>
                  <TextField
                    fullWidth={true}
                    floatingLabelText="API Server"
                    onChange={e => this.setState(
                      {
                        dredd_server: e.target.value
                      }
                    )}
                  /><br />
                  <SelectField
                    fullWidth={true}
                    floatingLabelText="Logging Level"
                    value={this.state.dredd_level}
                    onChange={this.handleSelectLevel}
                  >
                    <MenuItem value={1} primaryText="info" />
                    <MenuItem value={2} primaryText="debug" />
                  </SelectField>
                  <br />
                  <TextField
                    fullWidth={true}
                    floatingLabelText="Swagger Path"
                    onChange={e => this.setState(
                      {
                        dredd_path: e.target.value
                      }
                    )}
                  /><br />
              </div>

              {this.state.reportRun &&
                <div>
                  {/* <h3>Results</h3>
                  <List>
                    <ListItem primaryText={'Report Started: ' + (this.state.stats.start || '')} />
                    <ListItem primaryText={'Report Ended: ' + this.state.stats.end || ''} />
                    <ListItem primaryText={'Duration: ' + this.state.stats.duration || ''} />
                    <ListItem primaryText={'Tests: ' + this.state.stats.tests || ''} />
                    <ListItem primaryText={'Errors: ' + this.state.stats.errors || ''} />
                    <ListItem primaryText={'Failures: ' + this.state.stats.failures || ''} />
                    <ListItem primaryText={'File Based Reporters: ' + this.state.stats.fileBasedReporters || ''} />
                    <ListItem primaryText={'Passes: ' + this.state.stats.passes || ''} />
                    <ListItem primaryText={'Skipped: ' + this.state.stats.skipped || ''} />
                  </List> */}
                </div>
              }
            </CardText>
            <CardActions>
              <FlatButton label="Run Report" onClick={this.runReport} disabled={this.state.reportRunning} />
            </CardActions>
          </Card>
        </div>
    );
  }
}


export default DreddUI;
