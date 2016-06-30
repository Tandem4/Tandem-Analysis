import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { View, ScrollView, Text, ListView, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import  NavigationBar  from 'react-native-navbar';


import styles from './styles.js';
import articlesData from '../data/articlesData';
import ArticleContainer from './ArticleContainer';
import * as storyActions from './storyActions';
import styles from '../assets/styles.js';
import Store from '../store.js';

class Story extends Component {
  componentWillMount() {
    this.prepopulateData.bind(this)();
  }

  prepopulateData() {
    var context = this;

    // TODO:  Pass in the trend id from Trend view onPress event
    fetch('http://192.241.210.120:1337/api/v1/trends/1')
    .then(function(res) {
      context.props.requestArticles(JSON.parse(res._bodyText));
    })
    .catch(function(err) {
      console.log("SOMETHING WENT WRONG", err);
    });
  }

  navigate() { this.props.navigator.push({ name: 'Trend' }); }

	render() {
		const { state, actions } = this.props;
		return (
			<View>
			    <TouchableHighlight style={styles.full} onPress={ this.navigate.bind(this) }>
			      <Text style={styles.trendRow} >Back</Text>
			    </TouchableHighlight>
	        <ListView
	          dataSource={this.props.dataSource}
	          {...actions}
	          renderRow = {ArticleContainer}
            enableEmptySections={true}
	        />
        </ScrollView>
      </View>
    )
	}
}

function mapStateToProps(state) {
	return {
		articlesData: state.articlesData,
		// for ListView
		dataSource: function() {
      var currentArticles = state.dataSource.cloneWithRows(state.articlesData.articles || []);

      currentArticles._dataBlob.s1.sort(function(a, b) {
        if (a.created_at > b.created_at) {
            return -1;
          }
          if (a.created_at < b.created_at) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });

      return currentArticles;
    }()
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(storyActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Story);
