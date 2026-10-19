import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { TemplateProps } from '../types'
import { ContactLine, CvSections, PageNumber } from '../shared/content'
import { styles } from './styles'

export function ClassicDocument({ cv, appearance }: TemplateProps) {
  return (
    <Document
      title={`${cv.personal.fullName || 'Untitled'} - CV`}
      author={cv.personal.fullName}
      creator="Sira Datiya CV"
    >
      <Page
        size={appearance.pageSize}
        style={[styles.page, { fontSize: appearance.fontSize }]}
      >
        <View style={[styles.header, { borderBottomColor: appearance.accent }]}>
          <Text style={styles.name}>{cv.personal.fullName || 'Your name'}</Text>
          <Text style={[styles.title, { color: appearance.accent }]}>
            {cv.personal.jobTitle || 'Professional title'}
          </Text>
          <ContactLine cv={cv} />
        </View>
        <CvSections cv={cv} appearance={appearance} />
        <PageNumber />
      </Page>
    </Document>
  )
}
