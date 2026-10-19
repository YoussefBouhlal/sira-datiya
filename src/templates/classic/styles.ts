import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    padding: 44,
    paddingBottom: 52,
    fontFamily: 'Times-Roman',
    color: '#252b29',
  },
  header: { textAlign: 'center', paddingBottom: 16, borderBottomWidth: 1 },
  name: { fontSize: 30, marginBottom: 6, fontFamily: 'Times-Bold' },
  title: { fontSize: 13, marginBottom: 9 },
})
