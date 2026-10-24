import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 35,
    fontFamily: 'Helvetica',
    color: '#222222',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  identity: { flexBasis: 0, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  name: { fontFamily: 'Helvetica-Bold', lineHeight: 1.1 },
  jobTitle: { marginTop: 2, lineHeight: 1.15 },
  contact: { marginTop: 2, lineHeight: 1.2 },
  portrait: { width: 64, height: 64, objectFit: 'cover', marginLeft: 14 },
  section: { marginTop: 10 },
  heading: {
    borderBottomWidth: 0.8,
    paddingBottom: 2,
    marginBottom: 4,
    lineHeight: 1.15,
  },
  body: { lineHeight: 1.15 },
  entry: { marginBottom: 6 },
  entryHeader: { marginBottom: 3 },
  entryTitle: { fontFamily: 'Helvetica-Bold', lineHeight: 1.15 },
  bullet: { paddingLeft: 13, lineHeight: 1.15 },
  skillRow: { flexDirection: 'row' },
  skill: { width: '25%', paddingRight: 8, paddingBottom: 2, lineHeight: 1.15 },
  pageNumber: {
    position: 'absolute',
    bottom: 27,
    right: 35,
    fontSize: 8,
    color: '#444444',
  },
})
