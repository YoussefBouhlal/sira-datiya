import { Document, Page, View } from '@react-pdf/renderer'
import { Text } from '../shared/Text'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { CvSections, PageNumber, Portrait } from '../shared/content'
import type { TemplateProps } from '../types'
import { styles } from './styles'

export function SidebarDocument({ cv, appearance }: TemplateProps) {
  const { personal } = cv
  const contact = [
    personal.location,
    personal.email,
    personal.phone,
    personal.website,
    personal.linkedin,
  ].filter((value) => value.trim())
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const languages = cv.languages.filter((language) => language.trim())
  const backgroundColor = `#${appearance.accent
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) =>
      Math.round(parseInt(channel, 16) * 0.7)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
  return (
    <Document
      title={`${personal.fullName || 'Untitled'} - CV`}
      author={personal.fullName}
      creator="Sira Datiya CV"
    >
      <Page
        size={appearance.pageSize}
        style={[styles.page, { fontSize: appearance.fontSize - 1 }]}
      >
        <View fixed style={[styles.background, { backgroundColor }]} />
        <View style={styles.columns}>
          <View style={[styles.sidebar, { fontSize: appearance.fontSize - 2 }]}>
            <View style={styles.identity}>
              <Portrait cv={cv} />
              <Text style={styles.name}>
                {personal.fullName || 'Your name'}
              </Text>
              {personal.jobTitle.trim() && (
                <>
                  <View style={styles.separator} />
                  <Text style={styles.title}>{personal.jobTitle}</Text>
                </>
              )}
            </View>
            {contact.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.heading} minPresenceAhead={30}>
                  Details
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
                  Skills
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
                        <Text style={styles.level}>
                          {proficiencyLevels[skill.level - 1]}
                        </Text>
                        <View style={styles.track} />
                        <View
                          style={[
                            styles.fill,
                            { width: `${skill.level * 20}%` },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            {languages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.heading} minPresenceAhead={30}>
                  Languages
                </Text>
                {languages.map((language, index) => (
                  <Text key={index} style={styles.contact}>
                    {language}
                  </Text>
                ))}
              </View>
            )}
          </View>
          <View style={styles.main}>
            <CvSections cv={cv} appearance={appearance} variant="sidebar" />
          </View>
        </View>
        <PageNumber />
      </Page>
    </Document>
  )
}
