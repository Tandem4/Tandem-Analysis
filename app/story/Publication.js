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
	    <View style={styles.firstRow}>
	      <Text style={styles.publication}>{this.props.publication}</Text>
	      <Text style={styles.headline}>{this.props.headline}</Text>
	    </View>
		)
	}
}

export default Publication;