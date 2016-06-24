
const dataSource = (state = {}, action) => {
  switch (action.type) {
  	case 'UPDATE_DATASOURCE':
  	  return action.type;
    default: 
      return state;
  }
};

export default dataSource;