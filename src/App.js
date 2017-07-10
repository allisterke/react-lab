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
        )
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            logined: false,
            username: '',
            password: ''
        };
        this.handleLogin = this.handleLogin.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
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
                    this.setState({logined: true});
                }
            }
        );
        e.preventDefault();
    }
    render() {
        const loginWindow = (
          <MuiThemeProvider>
              <Center>
                  <div>
                  <h1>Welcome to iMarket</h1>
                  <form method="post" onSubmit={this.handleLogin}>
                      <div><TextField hintText="username" name="username" value={this.state.username} onChange={this.handleInputChange} /></div>
                      <div><TextField hintText="password" name="password" type="password" value={this.state.password} onChange={this.handleInputChange} /></div>
                      <Center>
                      <RaisedButton label="Login" type="submit" />
                      </Center>
                  </form>
                  </div>
              </Center>
          </MuiThemeProvider>
        );
        const companiesWindow = (
            <Companies />
        );
        if(!this.state.logined) {
            return loginWindow;
        }
        else {
            return companiesWindow;
        }
    }
}

export default App;
