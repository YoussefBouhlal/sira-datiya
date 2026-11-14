import { StyleSheet } from '@react-pdf/renderer'
import type { TemplateProps } from '../types'

export function createStyles(appearance: TemplateProps['appearance']) {
  const { fontSize } = appearance
  const band =
    appearance.colors?.accent ??
    (appearance.accent === '#177568' ? '#486994' : appearance.accent)
  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: fontSize - 2,
      color: '#222222',
      paddingTop: 56,
      paddingBottom: 36,
    },
    background: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: '39%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: band,
      minHeight: 92,
      marginBottom: 34,
    },
    portraitSlot: { width: '39%', paddingHorizontal: 36 },
    portrait: {
      width: 136,
      height: 136,
      objectFit: 'cover',
      marginTop: -24,
      marginBottom: -40,
    },
    identity: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      paddingHorizontal: 22,
      paddingVertical: 15,
    },
    name: {
      fontFamily: 'Helvetica-Bold',
      color: '#ffffff',
      fontSize: fontSize * 2.6,
      lineHeight: 1.15,
    },
    jobTitle: {
      color: '#ffffff',
      fontSize: fontSize - 1,
      textTransform: 'uppercase',
      lineHeight: 1.4,
      marginTop: 6,
    },
    columns: { flexDirection: 'row', alignItems: 'flex-start' },
    sidebar: { width: '39%', paddingHorizontal: 36, paddingTop: 14 },
    main: { width: '61%', paddingLeft: 22, paddingRight: 36 },
    section: { marginTop: 18 },
    heading: {
      fontFamily: 'Helvetica-Bold',
      fontSize: fontSize + 1,
      color: '#ffffff',
      backgroundColor: band,
      paddingHorizontal: 7,
      paddingVertical: 5,
      lineHeight: 1.25,
      marginBottom: 7,
    },
    entryHeader: { marginTop: 7, marginBottom: 3 },
    entryTitle: {
      fontFamily: 'Helvetica-Bold',
      fontSize: fontSize - 2,
      lineHeight: 1.4,
    },
    detail: { color: '#41494e', fontSize: fontSize - 3, lineHeight: 1.4 },
    body: { fontSize: fontSize - 2, lineHeight: 1.45, marginBottom: 4 },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 9,
    },
    contactIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: band,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
      flexShrink: 0,
    },
    contactValue: { flexGrow: 1, flexShrink: 1, flexBasis: 0, paddingTop: 4 },
    footer: {
      position: 'absolute',
      bottom: 16,
      right: 36,
      color: '#41494e',
      fontSize: 8,
    },
  })
}
