// This component will be responsible for switching between views
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
// import IssueList from './IssueList.jsx';
// import IssueReport from './IssueReport.jsx';
// import IssueEdit from './IssueEdit.jsx';
// import About from './About.jsx';

// const NotFound = () => <h1>Page Not Found</h1>;

import routes from './routes.js';

export default function Contents() {
  return (
    <Switch>
      <Redirect exact from="/" to="/issues" />
      {/* <Route path="/issues" component={IssueList} />
      <Route path="/edit/:id" component={IssueEdit} />
      <Route path="/report" component={IssueReport} />
      <Route path="/about" component={About} />
      <Route component={NotFound} /> */}
      {routes.map(attrs => <Route {...attrs} key={attrs.path} />)}
    </Switch>
  );
}
