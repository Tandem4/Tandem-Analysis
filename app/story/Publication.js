import React, { Component, PropTypes, Linking} from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, WebView, TouchableHighlight } from 'react-native';
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
		    <View style={styles.publication}>
			    <View>
			      <Text style={styles.publicationText}>
			        {this.props.publication}
			      </Text>
		      </View>
		      <View style={styles.moodScore}>
	          <Slant mood={this.props.moodScore} />
          </View>
	      </View>
	      <View style={styles.headline}>
		      <Text style={styles.headlineText}>
		        {this.props.headline}
		      </Text>
	      </View>
	    </View>
		)
	}
}

export default Publication;