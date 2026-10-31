import { Document, Page } from '@react-pdf/renderer'
import { modernTemplate } from './index'
import { PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle } from '../shared/localization'
import { translate } from '../../i18n/messages'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import {
  ContactLine,
  CvSections,
  PageNumber,
  Portrait,
} from '../shared/content'
import { styles } from './styles'

export function ModernDocument({ cv, appearance }: TemplateProps) {
  const t = (text: string) => translate(appearance.language, text)
  return (
    <Document
      title={`${cv.personal.fullName || 'Untitled'} - CV`}
      author={cv.personal.fullName}
      creator="Sira Datiya CV"
      language={appearance.language}
    >
      <PdfLanguage
        language={appearance.language}
        colors={appearance.colors}
        headings={cv.headings}
        headingDefaults={modernTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View
            style={[
              styles.header,
              {
                borderLeftColor: appearance.colors?.accent ?? appearance.accent,
              },
            ]}
          >
            <Portrait cv={cv} />
            <Text colorRole="headings" style={styles.name}>
              {cv.personal.fullName || t('Your name')}
            </Text>
            <Text
              colorRole="details"
              style={[styles.title, { color: appearance.accent }]}
            >
              {cv.personal.jobTitle || t('Professional title')}
            </Text>
            <ContactLine cv={cv} />
          </View>
          <CvSections cv={cv} appearance={appearance} />
          <PageNumber />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
