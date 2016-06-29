import React, { Component, PropTypes, TouchableHighlight } from 'react';
import { bindActionCreators } from 'redux';
import { View, ScrollView, Text, ListView } from 'react-native';
import { connect } from 'react-redux';

import articlesData from '../data/articlesData';
import ArticleContainer from './ArticleContainer';
import * as storyActions from './storyActions';

class Story extends Component {
	render() {
		const { state, actions } = this.props;
		return (
			<View>
	        <ListView
	          dataSource={this.props.dataSource}
	          {...actions}
	          renderRow = {ArticleContainer}
	        />
      </View>		
    )
	}
}

function mapStateToProps(state) {
	return {
		articlesData: state.articlesData,
		// for ListView
		dataSource: state.dataSource.cloneWithRows(state.articlesData)
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(storyActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Story);