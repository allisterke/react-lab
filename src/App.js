import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Center from 'react-center';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import uuid from 'uuid/v4';
import QRCode from 'qrcode.react';
import Paper from "material-ui/Paper";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import ContentLink from "material-ui/svg-icons/content/link";
import Divider from "material-ui/Divider";
import ContentCopy from "material-ui/svg-icons/content/content-copy";
import Home from "material-ui/svg-icons/action/home";
import Code from "material-ui/svg-icons/action/code";
import Notifications from "material-ui/svg-icons/social/notifications";
import Settings from "material-ui/svg-icons/action/settings";
import {ActionDelete, ActionExitToApp} from "material-ui/svg-icons";

class Companies extends Component {
  constructor() {
    super();
    this.state = {companies: []};
    this.getCompanies();
  }
  getCompanies() {
    fetch('http://localhost:8080/rest/companies', {
      credentials: 'include'
    }).then(
      (res) => {
        return res.json();
      }
    ).then(
      (obj) => {
        this.setState({companies: obj});
      }
    )
  }
  render() {
    const companies = this.state.companies.map((company) => (
      <TableRow key={company.name}>
        <TableRowColumn>{company.name}</TableRowColumn>
        <TableRowColumn>{company.leader}</TableRowColumn>
      </TableRow>
    ));
    return (
      <div>
      <MuiThemeProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderColumn>Company</TableHeaderColumn>
                <TableHeaderColumn>Leader</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
            {companies}
            </TableBody>
          </Table>
      </MuiThemeProvider>
      </div>
    )
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      logined: false,
      username: '',
      password: '',
      component: 'home',
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSettingsChange = this.handleSettingsChange.bind(this)
  }
  handleInputChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    this.setState({
      [name]: value
    });
  }
  handleLogin(e) {
    const { username, password } = this.state;
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    // fetch(`http://localhost:8080/login?username=${username}&password=${password}`,
    fetch(`http://localhost:8080/login.html`,
      {
        credentials: 'include',
        method: 'POST',
        headers: headers,
        body: `username=${username}&password=${password}`
      }
    ).then(
      (res) => {
        if(res.ok) {
          return res.text();
        }
        else {
          return new Promise(() => { return "failure"; });
        }
      }
    ).then(
      (text) => {
        if(text === "success") {
          this.setState({logined: true, component: 'home'});
          this.getStoreList();
          this.getMaterialList();
        }
      }
    );
    e.preventDefault();
  }
  getStoreList() {
    fetch(`http://localhost:8080/store`).then(
      (res) => {
        if(res.ok) {
          return res.json();
        }
        else {
          return new Promise(() => { return "failure"; });
        }
      }
    ).then(
      (obj) => {
          // console.log(obj);
          this.setState({storeList: obj});
      }
    );
  }
  getMaterialList() {
    fetch(`http://localhost:8080/material`).then(
      (res) => {
        if(res.ok) {
          return res.json();
        }
        else {
          return new Promise(() => { return "failure"; });
        }
      }
    ).then(
      (obj) => {
        // console.log(obj);
        this.setState({materialList: obj});
      }
    );
  }
  getRemainingList() {
    fetch(`http://localhost:8080/remain`).then(
      (res) => {
        if(res.ok) {
          return res.json();
        }
        else {
          return new Promise(() => { return "failure"; });
        }
      }
    ).then(
      (obj) => {
        // console.log(obj);
        this.setState({remainList: obj});
      }
    );
  }
  getSettingsList() {
    fetch(`http://localhost:8080/settings`).then(
      (res) => {
        if(res.ok) {
          return res.json();
        }
        else {
          return new Promise(() => { return "failure"; });
        }
      }
    ).then(
      (obj) => {
        // console.log(obj);
        this.setState({settingsList: obj});
      }
    );
  }
  select(component) {
    switch (component) {
      case 'settings':
        this.getSettingsList();
        break;
      case 'replenish':
        this.getSettingsList();
        this.getRemainingList();
        break;
      case 'remaining':
        this.getSettingsList();
        this.getRemainingList();
        this.remainingThread = setInterval(() => {this.getRemainingList();}, 3000);
        break;
      case 'logout':
        this.handleLogout();
        break;
    }
    if(component != 'remaining' && this.remainingThread) {
      clearInterval(this.remainingThread);
      delete this.remainingThread;
    }
    this.setState({'component': component});
  }
  handleLogout() {
    fetch(`http://localhost:8080/logout`);
    this.state = {
      logined: true,
      username: '',
      password: '',
      component: 'home',
    };
    this.setState({logined: false});
  }
  handleSettingsChange(e) {
    let [label, id] = e.target.id.split('-');
    let value = parseInt(e.target.value);
    if(this.state.settingsList && !isNaN(value)) {
      this.state.settingsList[id-1][label] = parseInt(value);

      fetch(`http://localhost:8080/update-settings?materialId=${id}&warn=${this.state.settingsList[id-1].warn}&fill=${this.state.settingsList[id-1].fill}`);
    }
  }
  render() {
    const loginWindow = (
      <div className="center" style={{border: '5px groove'}}>
        <MuiThemeProvider>
          <div style={{padding: '20px 40px'}}>
          <h1>Inventory Management</h1>
          <form method="post" onSubmit={this.handleLogin}>
            <div><TextField style={{width: "100%"}} hintText="username" name="username" value={this.state.username} onChange={this.handleInputChange} /></div>
            <div><TextField style={{width: "100%"}} hintText="password" name="password" type="password" value={this.state.password} onChange={this.handleInputChange} /></div>
            <Center>
            <RaisedButton label="Login" type="submit" />
            </Center>
          </form>
          </div>
        </MuiThemeProvider>
      </div>
    );
    const controlPanel = (
      <MuiThemeProvider>
      <div className="layout">
        <div className="menu">
        <div>
          <Paper style={{
          display: 'inline-block',
          float: 'right',
          // width: '100%',
          margin: '0 32px 16px 0',
          }}>
          <Menu>
            <MenuItem primaryText="Home" leftIcon={<Home />} onClick={() => {this.select("home")}}/>
            <Divider />
            <MenuItem primaryText="QR Code" leftIcon={<Code />} onClick={() => {this.select("qrcode")}}/>
            <Divider />
            <MenuItem primaryText="Store" leftIcon={<ContentLink />} onClick={() => {this.select("store")}}/>
            <MenuItem primaryText="Material" leftIcon={<ContentCopy />} onClick={() => {this.select("material")}}/>
            <Divider />
            <MenuItem primaryText="Remaining" leftIcon={<ActionDelete />} onClick={() => {this.select("remaining")}}/>
            <MenuItem primaryText="Replenish" leftIcon={<ActionDelete />} onClick={() => {this.select("replenish")}}/>
            <Divider />
            <MenuItem primaryText="Notifications" leftIcon={<Notifications />} onClick={() => {this.select("notifications")}}/>
            <MenuItem primaryText="Settings" leftIcon={<Settings />} onClick={() => {this.select("settings")}}/>
            <Divider />
            <MenuItem primaryText="Logout" leftIcon={<ActionExitToApp />} onClick={() => {this.select("logout")}}/>
          </Menu>
          </Paper>
        </div>
        </div>
        <div className="board">
        <Paper className="full flex">
          { this.state.component === 'home' ?
            (
              <h1 className="center">Welcome</h1>
            ) : this.state.component === 'qrcode' ?
            (
              <div className="center"><QRCode value={`${uuid()}\n1\n$100\n`} size={256} /></div>
            ) : this.state.component === 'store' ?
            (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Location</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.storeList.map((store) => (
                      <TableRow key={store.id}>
                        <TableRowColumn>{store.name}</TableRowColumn>
                        <TableRowColumn>{store.location}</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) : this.state.component === 'material' ?
            (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Unit</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.materialList.map((material) => (
                      <TableRow key={material.id}>
                        <TableRowColumn>{material.name}</TableRowColumn>
                        <TableRowColumn>{material.unit}</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) : this.state.component === 'remaining' ?
            (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn>Store</TableHeaderColumn>
                    <TableHeaderColumn>Material</TableHeaderColumn>
                    <TableHeaderColumn>Amount</TableHeaderColumn>
                    <TableHeaderColumn>Warning Amount</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.remainList && this.state.settingsList &&
                    this.state.remainList.map((remain) => (
                      <TableRow key={`${remain.storeId} ${remain.materialId}`} className={remain.amount < this.state.settingsList[remain.materialId - 1].warn ? "warn" : "normal"}>
                        <TableRowColumn>{this.state.storeList[remain.storeId - 1].name}</TableRowColumn>
                        <TableRowColumn>{this.state.materialList[remain.materialId - 1].name}</TableRowColumn>
                        <TableRowColumn>{`${remain.amount}${this.state.materialList[remain.materialId - 1].unit}`}</TableRowColumn>
                        <TableRowColumn>{`${this.state.settingsList[remain.materialId - 1].warn}${this.state.materialList[remain.materialId - 1].unit}`}</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) : this.state.component === 'settings' ?
            (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn>Material</TableHeaderColumn>
                    <TableHeaderColumn>Warning Amount</TableHeaderColumn>
                    <TableHeaderColumn>Fill Amount</TableHeaderColumn>
                    <TableHeaderColumn>Unit</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.settingsList &&
                    this.state.settingsList.map((settings) => (
                      <TableRow key={settings.materialId}>
                        <TableRowColumn>{this.state.materialList[settings.materialId - 1].name}</TableRowColumn>
                        <TableRowColumn><TextField id={`warn-${settings.materialId}`} defaultValue={settings.warn} onChange={this.handleSettingsChange} /></TableRowColumn>
                        <TableRowColumn><TextField id={`fill-${settings.materialId}`} defaultValue={settings.fill} onChange={this.handleSettingsChange} /></TableRowColumn>
                        <TableRowColumn>{this.state.materialList[settings.materialId - 1].unit}</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) : this.state.component === 'replenish' ?
            (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn>Store</TableHeaderColumn>
                    <TableHeaderColumn>Material</TableHeaderColumn>
                    <TableHeaderColumn>Remain</TableHeaderColumn>
                    <TableHeaderColumn>Fill</TableHeaderColumn>
                    <TableHeaderColumn>Replenish</TableHeaderColumn>
                    <TableHeaderColumn>Unit</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    this.state.remainList && this.state.settingsList &&
                    this.state.remainList.map((remain) => (
                      <TableRow key={`${remain.storeId} ${remain.materialId}`} className={remain.amount < this.state.settingsList[remain.materialId - 1].warn ? "warn" : "normal"}>
                        <TableRowColumn>{this.state.storeList[remain.storeId - 1].name}</TableRowColumn>
                        <TableRowColumn>{this.state.materialList[remain.materialId - 1].name}</TableRowColumn>
                        <TableRowColumn>{remain.amount}</TableRowColumn>
                        <TableRowColumn>{this.state.settingsList[remain.materialId - 1].fill}</TableRowColumn>
                        <TableRowColumn>{Math.max(0, this.state.settingsList[remain.materialId - 1].fill - remain.amount)}</TableRowColumn>
                        <TableRowColumn>{this.state.materialList[remain.materialId - 1].unit}</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) :
            (
              <h1 className="center">{`${this.state.component} is not implemented`.toUpperCase()}</h1>
            )
          }
        </Paper>
        </div>
      </div>
      </MuiThemeProvider>
    );
    if(!this.state.logined) {
      return loginWindow;
    }
    else {
      return controlPanel;
    }
  }
}

export default App;
