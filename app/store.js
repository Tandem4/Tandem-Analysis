import { createStore, compose, applyMiddleware } from 'redux';
import { ListView } from 'react-native';

import rootReducer from './rootReducer';
// import trendsData from './data/trendsData';
// import articlesData from './data/articlesData';

let trendsData   = { message: "Loading Trends..." };
let articlesData = { message: "Loading Articles..." };

// for ListView
let dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2,
})

const defaultState = {
  trendsData,
	articlesData,
	dataSource
}

const Store = createStore(rootReducer, defaultState);

export default Store;
