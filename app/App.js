import React, { Component } from 'react';
import { Navigator, Image } from 'react-native';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import Story from './story/Story';
import store from './store';

class App extends Component {
	render() {
		return (
      <Provider store={store}>
        <Navigator
          initialRoute={{name: 'List', component: Story}}
          configureScene={() => ({
          	...Navigator.SceneConfigs.VerticalDownSwipeJump,
          	gestures: {},
          })}
          renderScene={(route, navigator) => {
          	if (route.component) {
          		return React.createElement(route.component, { navigator, ...route.passProps });
          	}
          }}
        />
      </Provider>
		)
	}
}

export default App;