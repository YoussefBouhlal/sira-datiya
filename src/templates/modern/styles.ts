import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    padding: 44,
    paddingBottom: 52,
    fontFamily: 'Helvetica',
    color: '#252b29',
  },
  header: { paddingLeft: 16, borderLeftWidth: 4, paddingBottom: 4 },
  name: { fontSize: 29, fontFamily: 'Helvetica-Bold', marginBottom: 7 },
  title: { fontSize: 13, marginBottom: 10 },
})
