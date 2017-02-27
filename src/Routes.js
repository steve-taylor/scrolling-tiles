import React from 'react';
import {Route, Router, IndexRedirect, browserHistory} from 'react-router';
import PageLayout from './layouts/PageLayout';
import Home from './pages/Home';
import {RoutePath, basePath, absoluteRoutePath} from './Routing';

const Routes = () => (
  <Router history={browserHistory}>

    <Route path="/">
      <Route path={basePath} component={({children}) => <PageLayout>{children}</PageLayout>}>
        <Route path={RoutePath.HOME} component={Home}/>
      </Route>

      <IndexRedirect to={absoluteRoutePath(RoutePath.HOME)}/>
    </Route>

    <Route path="*" component={() => <div>Not found :(</div>}/>
  </Router>
);

export default Routes;
