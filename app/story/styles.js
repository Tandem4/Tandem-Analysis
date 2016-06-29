import { Animated, StyleSheet, View, Text, Dimensions } from 'react-native';

let styles = StyleSheet.create({
  body: {
    backgroundColor: '#eaedf1',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 15,
    paddingBottom: 15,
    marginLeft: 15,
    marginRight: 15,
    borderBottomWidth: 4,
    borderBottomColor: '#eaedf1',
    backgroundColor: '#ffffff'
  },
  publication: {
    flexDirection: 'row',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: '#323a45'
  },
  publicationText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff'
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
    flex: 4
  },
  bar: {
    alignSelf: 'flex-end',
    borderRadius: 5,
    height: 4,
    marginRight: 5,
    backgroundColor: '#f55443',
  },
});

export default styles;