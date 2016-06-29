const trendsData = (state = {}, action) => {
  switch (action.type) {
    case 'REQUEST_TRENDS':
      return action.trends;
    default:
      return state;
  }
};

export default trendsData;
