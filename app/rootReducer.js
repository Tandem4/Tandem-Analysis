import { combineReducers } from 'redux';

import dataSource from './reducers/dataSourceReducer';
import articlesData from './reducers/articlesDataReducer';

const rootReducer = combineReducers({
  articlesData,
  dataSource
});

export default rootReducer;