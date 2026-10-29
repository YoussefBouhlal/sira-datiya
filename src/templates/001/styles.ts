import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingHorizontal: 60,
    paddingBottom: 52,
    fontFamily: 'Times-Roman',
    color: '#171717',
  },
  header: { textAlign: 'center', paddingBottom: 8 },
  name: { marginBottom: 8, fontFamily: 'Times-Bold' },
  contact: { lineHeight: 1.35 },
  section: { marginTop: 14, paddingTop: 8, borderTopWidth: 0.9 },
  heading: {
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginBottom: 9,
  },
  row: { flexDirection: 'row' },
  rail: { width: '23.5%', paddingRight: 12, flexShrink: 0 },
  content: { width: '76.5%', minWidth: 0 },
  entry: { flexDirection: 'row', marginBottom: 10 },
  dates: { width: '23.5%', paddingRight: 12, paddingTop: 2 },
  entryHeader: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'baseline',
  },
  entryTitle: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  location: { maxWidth: '36%', marginLeft: 10, textAlign: 'right' },
  body: { lineHeight: 1.25 },
  bullet: { marginBottom: 2, lineHeight: 1.2, paddingLeft: 4 },
  languages: { flexDirection: 'row', flexWrap: 'wrap' },
  language: {
    width: '50%',
    paddingRight: 12,
    marginBottom: 4,
    lineHeight: 1.25,
  },
  additionalEntry: { marginBottom: 9 },
  additionalTitle: { fontFamily: 'Times-Bold', marginBottom: 3 },
})
