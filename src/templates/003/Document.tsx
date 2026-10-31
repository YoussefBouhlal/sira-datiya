import { Document, Page } from '@react-pdf/renderer'
import { PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle } from '../shared/localization'
import { translate } from '../../i18n/messages'
import { Text } from '../shared/Text'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { darkenColor, surfaceForeground } from '../../domain/cv/colors'
import { CvSections, PageNumber, Portrait } from '../shared/content'
import {
  resolveSectionHeading,
  resolveSkillProficiencyDisplay,
  type TemplateProps,
} from '../types'
import { sidebarTemplate } from './index'
import { styles } from './styles'

export function SidebarDocument({ cv, appearance }: TemplateProps) {
  const t = (text: string) => translate(appearance.language, text)
  const heading = (key: keyof typeof sidebarTemplate.headings) =>
    resolveSectionHeading(
      cv.headings,
      sidebarTemplate.headings,
      key,
      appearance.language,
    )
  const { personal } = cv
  const contact = [
    personal.location,
    personal.email,
    personal.phone,
    personal.website,
    personal.linkedin,
  ].filter((value) => value.trim())
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const proficiencyDisplay = resolveSkillProficiencyDisplay(
    sidebarTemplate,
    appearance.skillProficiencyDisplay,
  )
  const languages = cv.languages.filter((language) => language.trim())
  const backgroundColor =
    appearance.colors?.surface ?? darkenColor(appearance.accent)
  const foreground = surfaceForeground(backgroundColor)
  return (
    <Document
      title={`${personal.fullName || 'Untitled'} - CV`}
      author={personal.fullName}
      creator="Sira Datiya CV"
      language={appearance.language}
    >
      <PdfLanguage
        language={appearance.language}
        colors={appearance.colors}
        headings={cv.headings}
        headingDefaults={sidebarTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 1 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View fixed style={[styles.background, { backgroundColor }]} />
          <View style={styles.columns}>
            <PdfLanguage
              language={appearance.language}
              colors={{
                headings: foreground,
                details: foreground,
                body: foreground,
              }}
            >
              <View
                style={[
                  styles.sidebar,
                  { fontSize: appearance.fontSize - 2, color: foreground },
                ]}
              >
                <View style={styles.identity}>
                  <Portrait cv={cv} />
                  <Text style={styles.name}>
                    {personal.fullName || t('Your name')}
                  </Text>
                  {personal.jobTitle.trim() && (
                    <>
                      <View
                        style={[
                          styles.separator,
                          { backgroundColor: foreground },
                        ]}
                      />
                      <Text style={styles.title}>{personal.jobTitle}</Text>
                    </>
                  )}
                </View>
                {contact.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.heading} minPresenceAhead={30}>
                      {heading('details')}
                    </Text>
                    {contact.map((value, index) => (
                      <Text
                        key={index}
                        style={styles.contact}
                        orphans={2}
                        widows={2}
                      >
                        {value}
                      </Text>
                    ))}
                  </View>
                )}
                {skills.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.heading} minPresenceAhead={35}>
                      {heading('skills')}
                    </Text>
                    {skills.map((skill) => (
                      <View key={skill.id} style={styles.skill}>
                        <Text
                          minPresenceAhead={skill.level === null ? 0 : 24}
                          orphans={2}
                          widows={2}
                        >
                          {skill.name}
                        </Text>
                        {skill.level !== null && (
                          <View wrap={false}>
                            {proficiencyDisplay !== 'bar' && (
                              <Text
                                style={[
                                  styles.level,
                                  ...(appearance.colors?.surface
                                    ? [{ opacity: 1 }]
                                    : []),
                                ]}
                              >
                                {t(proficiencyLevels[skill.level - 1]!)}
                              </Text>
                            )}
                            {proficiencyDisplay !== 'text' && (
                              <>
                                <View
                                  style={[
                                    styles.track,
                                    { backgroundColor: foreground },
                                  ]}
                                />
                                <View
                                  style={[
                                    styles.fill,
                                    {
                                      width: `${skill.level * 20}%`,
                                      backgroundColor: foreground,
                                    },
                                  ]}
                                />
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {languages.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.heading} minPresenceAhead={30}>
                      {heading('languages')}
                    </Text>
                    {languages.map((language, index) => (
                      <Text key={index} style={styles.contact}>
                        {language}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </PdfLanguage>
            <View style={styles.main}>
              <CvSections cv={cv} appearance={appearance} variant="sidebar" />
            </View>
          </View>
          <PageNumber />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
