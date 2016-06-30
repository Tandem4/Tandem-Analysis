const articlesData = (state = {}, action) => {
  switch (action.type) {
  	case 'REQUEST_ARTICLES':
  	  return action.articles;
    default:
      return state;
  }
};

export default articlesData;
