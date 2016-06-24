import { Animated, StyleSheet, View, Text, Dimensions } from 'react-native';

let styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    backgroundColor: '#f4f4f4'
  },
  publication: {
    fontSize: 11
  },
  headline: {
    flexWrap: 'wrap',
    color: '#000',
    fontSize: 16
  },
  moodScore: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'column'
  },
  firstRow: {
    flex: 5
  },
  bar: {
    alignSelf: 'flex-end',
    borderRadius: 5,
    height: 4,
    marginRight: 5,
    backgroundColor: '#f55443',
  }
});

export default styles;