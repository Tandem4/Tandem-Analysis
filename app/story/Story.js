import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { View, ScrollView, Text, ListView } from 'react-native';
import { connect } from 'react-redux';
import  NavigationBar  from 'react-native-navbar';


import styles from './styles.js';
import articlesData from '../data/articlesData';
import ArticleContainer from './ArticleContainer';
import * as storyActions from './storyActions';

class Story extends Component {
	_handleBackPress(){
		console.log('Go back!');
	}
	render() {
		const { state, actions } = this.props;
		return (
			<View style={styles.body}>
				<NavigationBar
				  title={{title: 'Tandem News Feed', tintColor: '#fff', fontFamily: 'Silom'}}
				  leftButton={{title: 'Back', tintColor: '#fff'}}
				  tintColor={'#00afd1'}
				  style={{height: 100}}
				/>
				<View style={{paddingBottom: 20}}>
				  <Text>{' '}</Text>
				</View>
				<ScrollView
				  ref={(scrollView) => { _scrollView = scrollView; }}
				  automaticallyAdjustContentInsets={false}
				  scrollEventThrottle={200}>
	        <ListView
	          dataSource={this.props.dataSource}
	          {...actions}
	          renderRow = {ArticleContainer}
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
		dataSource: state.dataSource.cloneWithRows(state.articlesData)
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(storyActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Story);
