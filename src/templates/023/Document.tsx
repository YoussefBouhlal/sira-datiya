import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { dateRange, translate } from '../../i18n/messages'
import { PdfLanguage, View, Image, ContactText } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { PageNumber } from '../shared/content'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { bandeauTemplate } from './index'
import { styles } from './styles'

function Description({ text, accent }: { text: string; accent: string }) {
  return text.split('\n').map((value, index) => {
    const line = value.trim()
    if (!line) return null
    return /^(?:[\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line) ? (
      <Text key={index} style={styles.body} orphans={2} widows={2}>
        {line}
      </Text>
    ) : (
      <View key={index} style={{ flexDirection: 'row' }}>
        <View
          style={{
            width: 3,
            height: 3,
            marginTop: 5,
            marginRight: 4,
            borderWidth: 1,
            borderColor: accent,
            backgroundColor: accent,
            flexShrink: 0,
          }}
        />
        <Text
          style={[styles.body, { flexGrow: 1, flexShrink: 1, flexBasis: 0 }]}
          orphans={2}
          widows={2}
        >
          {line}
        </Text>
      </View>
    )
  })
}

function Section({
  title,
  surface,
  lead,
  children,
}: {
  title: SectionHeadingKey
  surface: string
  lead?: ReactNode
  children: ReactNode
}) {
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={35}>
        <Text
          section={title}
          colorRole="headings"
          style={[styles.heading, { backgroundColor: surface }]}
        >
          {heading(title)}
        </Text>
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({ title, details }: { title: string; details: string[] }) {
  return (
    <Text style={styles.entryTitle} minPresenceAhead={20}>
      <Text colorRole="headings" style={styles.title}>
        {title}
      </Text>
      <Text colorRole="details" style={styles.details}>
        {details
          .filter(Boolean)
          .map((value) => ` | ${value}`)
          .join('')}
      </Text>
    </Text>
  )
}

export function BandeauDocument({ cv, appearance }: TemplateProps) {
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const surface = appearance.colors?.surface ?? '#eef1fc'
  const accent = appearance.colors?.accent ?? appearance.accent
  const experience = cv.experience.filter(
    (entry) =>
      [
        entry.role,
        entry.employer,
        entry.location,
        entry.startDate,
        entry.endDate,
        entry.description,
      ].some((value) => value.trim()) || entry.current,
  )
  const education = cv.education.filter((entry) =>
    [
      entry.degree,
      entry.school,
      entry.startDate,
      entry.endDate,
      entry.description,
    ].some((value) => value.trim()),
  )
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const certifications = cv.certifications.filter((value) => value.trim())
  const projects = cv.projects.filter((entry) =>
    [entry.name, entry.url, entry.description].some((value) => value.trim()),
  )
  const references = cv.references.filter((entry) =>
    [
      entry.name,
      entry.jobTitle,
      entry.organization,
      entry.email,
      entry.phone,
    ].some((value) => value.trim()),
  )
  const experienceHeader = (
    entry: TemplateProps['cv']['experience'][number],
  ) => (
    <EntryHeader
      title={entry.role || entry.employer}
      details={[
        entry.role ? entry.employer : '',
        entry.location,
        dates(entry.startDate, entry.endDate, entry.current),
      ]}
    />
  )
  const educationHeader = (entry: TemplateProps['cv']['education'][number]) => (
    <EntryHeader
      title={entry.degree || entry.school}
      details={[
        entry.degree ? entry.school : '',
        dates(entry.startDate, entry.endDate),
      ]}
    />
  )
  const projectHeader = (entry: TemplateProps['cv']['projects'][number]) => (
    <EntryHeader title={entry.name} details={[entry.url]} />
  )
  const referenceHeader = (
    entry: TemplateProps['cv']['references'][number],
  ) => (
    <EntryHeader
      title={entry.name}
      details={[entry.jobTitle, entry.organization]}
    />
  )
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
        headingDefaults={bandeauTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={styles.header}>
            <View style={styles.identity}>
              <Text
                colorRole="headings"
                style={[styles.name, { fontSize: appearance.fontSize * 2.7 }]}
              >
                {cv.personal.fullName || t('Your name')}
              </Text>
              {cv.personal.jobTitle && (
                <Text colorRole="details" style={styles.jobTitle}>
                  {cv.personal.jobTitle}
                </Text>
              )}
              <ContactText
                values={[
                  cv.personal.phone,
                  cv.personal.email,
                  cv.personal.location,
                ]}
                centered
                style={[
                  styles.contacts,
                  { fontSize: appearance.fontSize * 0.8 },
                ]}
              />
              <View style={styles.links}>
                {[cv.personal.website, cv.personal.linkedin]
                  .filter((value) => value.trim())
                  .map((value, index) => (
                    <View
                      key={index}
                      style={[styles.chip, { backgroundColor: surface }]}
                    >
                      <ContactText
                        values={[value]}
                        centered
                        style={{
                          fontSize: appearance.fontSize * 0.8,
                          color: '#505050',
                        }}
                      />
                    </View>
                  ))}
              </View>
            </View>
            {cv.personal.portrait && (
              <Image src={cv.personal.portrait} style={styles.portrait} />
            )}
          </View>
          {cv.summary.trim() && (
            <Section title="summary" surface={surface}>
              <Text style={styles.body} orphans={2} widows={2}>
                {cv.summary}
              </Text>
            </Section>
          )}
          {experience.length > 0 && (
            <Section
              title="experience"
              surface={surface}
              lead={experienceHeader(experience[0]!)}
            >
              {experience.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && experienceHeader(entry)}
                  <Description text={entry.description} accent={accent} />
                </View>
              ))}
            </Section>
          )}
          {education.length > 0 && (
            <Section
              title="education"
              surface={surface}
              lead={educationHeader(education[0]!)}
            >
              {education.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && educationHeader(entry)}
                  <Description text={entry.description} accent={accent} />
                </View>
              ))}
            </Section>
          )}
          {skills.length > 0 && (
            <Section title="skills" surface={surface}>
              <Text style={styles.body} orphans={2} widows={2}>
                {skills.map((skill, index) => (
                  <Text key={skill.id}>
                    {index > 0 ? '   ' : ''}
                    {'\u25e6 '}
                    {skill.name}
                    {skill.level !== null && (
                      <Text colorRole="details">{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
                    )}
                  </Text>
                ))}
              </Text>
            </Section>
          )}
          {languages.length > 0 && (
            <Section title="languages" surface={surface}>
              <Text style={styles.body} orphans={2} widows={2}>
                {languages.map((value) => `\u25e6 ${value}`).join('   ')}
              </Text>
            </Section>
          )}
          {projects.length > 0 && (
            <Section
              title="projects"
              surface={surface}
              lead={projectHeader(projects[0]!)}
            >
              {projects.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && projectHeader(entry)}
                  <Description text={entry.description} accent={accent} />
                </View>
              ))}
            </Section>
          )}
          {certifications.length > 0 && (
            <Section title="certifications" surface={surface}>
              <Description text={certifications.join('\n')} accent={accent} />
            </Section>
          )}
          {references.length > 0 && (
            <Section
              title="references"
              surface={surface}
              lead={referenceHeader(references[0]!)}
            >
              {references.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && referenceHeader(entry)}
                  <ContactText
                    values={[entry.email, entry.phone]}
                    style={styles.body}
                  />
                </View>
              ))}
            </Section>
          )}
          <PageNumber />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
