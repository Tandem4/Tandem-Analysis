import React from 'react-native';
import { Router, Route } from 'react-native-router-flux';

import Main from './../main/Main';


class Routes extends React.Component {
	render() {
		return (
			<Router>
			  <Route name="main"
			    component={Main}
			    title="Main">
			    <Route>x

			  </Route>

			</Router>

		)
	}
}

export default Router;