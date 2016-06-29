import React, { Component, PropTypes, Linking} from 'react';
import { Animated, StyleSheet, View, Text, Dimensions, WebView, TouchableHighlight } from 'react-native';
import styles from './styles.js';

let staticURL = 'https://www.facebook.com';

class Publication extends Component {
	handleClick(){
    Linking.openURL(staticURL).catch(err => console.error('An error occured', err));
	}
	render() {
		return (
	    <View>
		    <View style={styles.publication}>
		      <Text style={styles.publicationText}>
}
		      </Text>
	      </View>
	      <View>
		      <Text style={styles.card}>
		        {this.props.headline}
		      </Text>
	      </View>
	    </View>
		)
	}
}

export default Publication;