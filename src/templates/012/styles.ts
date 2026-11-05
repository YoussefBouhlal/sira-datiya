import { StyleSheet } from '@react-pdf/renderer'

export function createStyles(fontSize: number) {
  return StyleSheet.create({
    page: {
      paddingTop: 32,
      paddingBottom: 48,
      paddingHorizontal: 88,
      fontFamily: 'Helvetica',
      fontSize,
      color: '#292929',
    },
    header: { marginTop: -32, marginHorizontal: -88, marginBottom: 16 },
    identity: {
      alignItems: 'center',
      paddingTop: 22,
      paddingBottom: 20,
      paddingHorizontal: 48,
    },
    portrait: {
      width: 40,
      height: 40,
      borderRadius: 20,
      objectFit: 'cover',
      marginBottom: 8,
    },
    name: {
      fontFamily: 'Times-Bold',
      fontSize: fontSize * 2.2,
      lineHeight: 1.15,
      textAlign: 'center',
    },
    jobTitle: {
      fontSize: fontSize * 0.7,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 5,
      lineHeight: 1.3,
    },
    contacts: {
      borderTopWidth: 0.5,
      paddingVertical: 10,
      paddingHorizontal: 48,
    },
    contact: {
      fontSize: fontSize * 0.75,
      textAlign: 'center',
      lineHeight: 1.5,
    },
    section: { marginTop: 18 },
    heading: {
      fontFamily: 'Times-Bold',
      fontSize: fontSize * 1.4,
      lineHeight: 1.2,
      marginBottom: 6,
    },
    entry: { marginBottom: 11 },
    entryHeader: { marginBottom: 3 },
    entryTitle: {
      fontFamily: 'Helvetica-Bold',
      fontSize,
      lineHeight: 1.4,
    },
    dates: { fontSize: fontSize * 0.85, lineHeight: 1.4, marginTop: 3 },
    body: { fontSize, lineHeight: 1.5 },
    description: { fontSize, lineHeight: 1.5, marginBottom: 2 },
    skillRow: { flexDirection: 'row', marginBottom: 8 },
    skill: { width: '50%', paddingRight: 24 },
    skillBar: {
      height: 5,
      borderRadius: 2.5,
      backgroundColor: '#eeeeee',
      marginTop: 4,
    },
    skillFill: { height: 5, borderRadius: 2.5 },
    pageNumber: { position: 'absolute', bottom: 24, right: 36, fontSize: 8 },
  })
}
