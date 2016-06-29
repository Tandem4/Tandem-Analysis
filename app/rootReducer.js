import { combineReducers } from 'redux';

import dataSource from './reducers/dataSourceReducer';
import articlesData from './reducers/articlesDataReducer';
import trendsData from './reducers/trendsDataReducer';

const rootReducer = combineReducers({
  trendsData,
  articlesData,
  dataSource
});

export default rootReducer;
