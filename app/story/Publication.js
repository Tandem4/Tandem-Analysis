import React, { Component, PropTypes, Linking} from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, WebView, TouchableHighlight, Slider } from 'react-native';
import Sldr from 'react-native-slider';
import Icon from 'react-native-vector-icons/Ionicons';


import styles from './styles.js';
import Slant from './Slant';

let staticURL = 'https://www.facebook.com';

class Publication extends Component {
	handleClick(){
    Linking.openURL(staticURL).catch(err => console.error('An error occured', err));
	}
	render() {
		return (
	    <View>

        {/* First Row => Pub & Graph Info */}
		    <View style={styles.firstRow}>

		      {/* Publication */}
			    <View style={styles.publication}>
			      <Text style={styles.publicationText}>
			        <Icon name="md-paper" size={17} color="#ffffff"></Icon>
			        { '   ' }
			        {this.props.publication}
			      </Text>
		      </View>

					{/* MoodScore Score #  */}
		      <View>
		        <Text style={styles.publicationText}>
		          {this.props.moodScore}
		        </Text>
		      </View>

					{/* MoodScore Graph  */}
		      <View style={styles.moodScore}>
		        <Sldr
		          minimumValue = {0}
		          maximumValue = {40}
		          minimumTrackTintColor = '#ffffff'
		          maximumTrackTintColor = '#ffffff'
		          thumbTintColor = '#ffffff'
		          disabled = { true }
		          value={this.props.moodScore} />

          </View>

	      </View>

				{/* Second Row => Headline Text */}
	      <View style={styles.headline}>
		      <Text style={styles.headlineText}>
		        {this.props.headline}
		        { ' ' }
		        <Icon name="ios-link" size={18} color="#5d5d5d"></Icon>
		      </Text>
	      </View>

	    </View>
		)
	}
}

export default Publication;
