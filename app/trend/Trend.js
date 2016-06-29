import React, { Component, PropTypes, TouchableHighlight } from 'react';
import { bindActionCreators } from 'redux';
import { View, ScrollView, Text, ListView } from 'react-native';
import { connect } from 'react-redux';

import Store from '../store.js';
import styles from '../assets/styles.js';
import articlesData from '../data/trendsData';
import DashContainer from './DashContainer';
import * as trendActions from './trendActions';

class Trend extends Component {
  componentWillMount() {

    // TODO: why does this not return until clicked again?
    this.prepopulateData.bind(this)();
  }

  prepopulateData() {
    var context = this;

    fetch('http://192.241.210.120:1337/api/v1/dashboard')
    .then(function(res) {
      context.props.requestTrends(JSON.parse(res._bodyText));
    })
    .catch(function(err) {
      console.log("SOMETHING WENT WRONG", err);
    });
  }

  // navigate(name) {
  //   alert('called navigate');
  //   this.props.navigator.push({
  //     name: 'Story',
  //     passProps: {
  //       name: name
  //     }
  //   })
  // }

// <Text>GO GO GO</Text>

  render() {
    const { state, actions } = this.props;
    return (
      <View style={styles.scroll}>

        <ScrollView
         ref={(scrollView) => { _scrollView = scrollView; }}
         automaticallyAdjustContentInsets={false}
         scrollEventThrottle={200}
         >
        <Text style={[styles.trendRow, styles.title]}>
          Newsfeed
        </Text>
        <Text style={styles.date}>{this.props.currentDate}</Text>
        <ListView
          dataSource={this.props.dataSource}
          {...actions}
          renderRow = {DashContainer}
        />
       </ScrollView>
      </View>
    )
  }
}

// <TouchableHighlight onPress={this.navigate}>
//         </TouchableHighlight>
// <TouchableHighlight onPress={ this._navigate }>
//     <Text>GO To View</Text>
// </TouchableHighlight>

// bring in from state parts that this component is interested in
function mapStateToProps(state) {
  return {
    trendsData: state.trendsData,
    currentDate: function() {
      return new Date().toDateString();
    }(),

    // for ListView
    dataSource: function() {
      console.log("Sort state data: ", state.trendsData);
      var currentTrends = state.dataSource.cloneWithRows(state.trendsData.trends || []);
      // console.log('trends from datasource in mapStateToProps', currentTrends);
      // console.log('trends from datasource in mapStateToProps', currentTrends._dataBlob.s1);
      currentTrends._dataBlob.s1.sort(function(a, b) {
        if (a.rank < b.rank) {
            return -1;
          }
          if (a.rank > b.rank) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });
      return currentTrends;
    }()
  }
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(trendActions, dispatch);
  // return { actions: bindActionCreators(actions, dispatch) }
}

export default connect(mapStateToProps, mapDispatchToProps)(Trend);
