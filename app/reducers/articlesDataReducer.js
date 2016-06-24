const articlesData = (state = {}, action) => {
  switch (action.type) {
  	case 'UPDATE_ARTICLEDATA':
  	  return action.type;
    default: 
      return state;
  }
};

export default articlesData;