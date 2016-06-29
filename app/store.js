import { createStore, compose, applyMiddleware } from 'redux';
import { ListView } from 'react-native';

import rootReducer from './rootReducer';
import articlesData from './data/articlesData';

let sucker = 'sucker free';
// for ListView 
let dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2,
})

const defaultState = {
	articlesData,
	dataSource
}

const Store = createStore(rootReducer, defaultState);

export default Store;


