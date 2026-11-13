import { Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { mistTemplate } from './index'
import { createStyles } from './styles'

type Entry = {
  id: string
  title: string
  organization?: string
  dates?: string
  description?: string
  contacts?: string[]
}

function Section({
  section,
  appearance,
  lead,
  children,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
  lead?: ReactNode
  children: ReactNode
}) {
  const styles = createStyles(appearance.fontSize, appearance.colors?.accent)
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={18}>
        <Text
          section={section}
          colorRole="headings"
          style={[
            styles.heading,
            section === 'summary' ? styles.summaryHeading : {},
          ]}
        >
          {heading(section)}
        </Text>
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({
  entry,
  appearance,
  education = false,
}: {
  entry: Entry
  appearance: TemplateProps['appearance']
  education?: boolean
}) {
  const styles = createStyles(appearance.fontSize)
  const dates = entry.dates && (
    <Text colorRole="details" style={styles.dates}>
      {entry.dates}
    </Text>
  )
  return (
    <View wrap={false} style={styles.entryHeader}>
      {!education && dates}
      {!education && entry.organization && (
        <Text colorRole="details" style={styles.organization}>
          {entry.organization}
        </Text>
      )}
      <Text colorRole="headings" style={styles.entryTitle}>
        {entry.title}
      </Text>
      {education && entry.organization && (
        <Text colorRole="details" style={styles.organization}>
          {entry.organization}
        </Text>
      )}
      {education && dates}
    </View>
  )
}

function Entries({
  section,
  entries,
  appearance,
  bullets = false,
}: {
  section: SectionHeadingKey
  entries: Entry[]
  appearance: TemplateProps['appearance']
  bullets?: boolean
}) {
  const styles = createStyles(appearance.fontSize)
  if (!entries.length) return null
  const header = (entry: Entry) => (
    <EntryHeader
      entry={entry}
      appearance={appearance}
      education={section === 'education'}
    />
  )
  return (
    <Section
      section={section}
      appearance={appearance}
      lead={header(entries[0]!)}
    >
      {entries.map((entry, index) => (
        <View key={entry.id}>
          {index > 0 && header(entry)}
          {entry.contacts?.some(Boolean) && (
            <ContactText values={entry.contacts} style={styles.contact} />
          )}
          {entry.description
            ?.split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, lineIndex) => (
              <Text key={lineIndex} style={styles.body} orphans={2} widows={2}>
                {bullets && !/^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
                  ? `\u2022 ${line}`
                  : line}
              </Text>
            ))}
        </View>
      ))}
    </Section>
  )
}

export function MistDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize, appearance.colors?.accent)
  const colors = effectiveColors(appearance, mistTemplate.colorDefaults)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const contacts = [
    {
      value: cv.personal.phone,
      path: 'M5 2h4l2 5-3 2a16 16 0 0 0 7 7l2-3 5 2v4c0 2-2 3-4 2C10 19 5 14 2 6c-1-2 1-4 3-4Z',
    },
    { value: cv.personal.email, path: 'M2 4h20v16H2ZM2 4l10 9L22 4' },
    {
      value: cv.personal.location,
      path: 'M12 22S4 13 4 9a8 8 0 1 1 16 0c0 4-8 13-8 13ZM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    },
    {
      value: cv.personal.website,
      path: 'M9 15l6-6M8 17l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 7l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
    },
    {
      value: cv.personal.linkedin,
      path: 'M4 9v12M4 3v1M10 21V9h5v2c4-4 7-1 7 3v7M15 11v10',
    },
  ].filter(({ value }) => value.trim())
  const skills = cv.skills.filter((entry) => entry.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const education: Entry[] = cv.education
    .filter((entry) =>
      [
        entry.degree,
        entry.school,
        entry.startDate,
        entry.endDate,
        entry.description,
      ].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.degree,
      organization: entry.school,
      dates: dates(entry.startDate, entry.endDate),
      description: entry.description,
    }))
  const experience: Entry[] = cv.experience
    .filter(
      (entry) =>
        entry.current ||
        [
          entry.role,
          entry.employer,
          entry.location,
          entry.startDate,
          entry.endDate,
          entry.description,
        ].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.role,
      organization: [entry.employer, entry.location].filter(Boolean).join(', '),
      dates: dates(entry.startDate, entry.endDate, entry.current),
      description: entry.description,
    }))
  const projects: Entry[] = cv.projects
    .filter((entry) =>
      [entry.name, entry.url, entry.description].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.name,
      contacts: [entry.url],
      description: entry.description,
    }))
  const certifications: Entry[] = cv.certifications
    .filter((value) => value.trim())
    .map((value, index) => ({ id: String(index), title: value }))
  const references = cv.references.filter((entry) =>
    [
      entry.name,
      entry.jobTitle,
      entry.organization,
      entry.email,
      entry.phone,
    ].some((value) => value.trim()),
  )
  const referenceRows = Array.from(
    { length: Math.ceil(references.length / 2) },
    (_, index) => references.slice(index * 2, index * 2 + 2),
  )
  const referenceRow = (row: typeof references) => (
    <View style={styles.referenceRow}>
      {row.map((entry) => (
        <View
          key={entry.id}
          style={[
            styles.reference,
            row.length === 1 ? styles.singleReference : {},
          ]}
        >
          <Text colorRole="headings" style={styles.entryTitle}>
            {entry.name}
          </Text>
          <Text colorRole="details" style={styles.organization}>
            {[entry.jobTitle, entry.organization].filter(Boolean).join(', ')}
          </Text>
          {[entry.phone, entry.email].filter(Boolean).map((value, index) => (
            <ContactText key={index} values={[value]} style={styles.contact} />
          ))}
        </View>
      ))}
    </View>
  )
  const summary = cv.summary.split('\n').filter((line) => line.trim())
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
        headingDefaults={mistTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[styles.page, pageLanguageStyle(appearance.language)]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <View wrap={false} style={styles.header}>
            <View style={[styles.band, { backgroundColor: colors.surface }]}>
              {cv.personal.portrait && (
                <Image src={cv.personal.portrait} style={styles.portrait} />
              )}
              <View style={styles.identity}>
                <Text colorRole="headings" style={styles.name}>
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle.trim() && (
                  <Text colorRole="details" style={styles.jobTitle}>
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.columns}>
            <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
              {contacts.map(({ value, path }, index) => (
                <View key={index} style={styles.contactRow}>
                  <Svg style={styles.contactIcon} viewBox="0 0 24 24">
                    <Path
                      d={path}
                      fill="none"
                      stroke={colors.details}
                      strokeWidth={1.6}
                    />
                  </Svg>
                  <View style={styles.contactValue}>
                    <ContactText values={[value]} style={styles.contact} />
                  </View>
                </View>
              ))}
              <Entries
                section="education"
                entries={education}
                appearance={appearance}
              />
              {skills.length > 0 && (
                <Section section="skills" appearance={appearance}>
                  {skills.map((entry) => (
                    <Text key={entry.id} style={styles.body}>
                      {`\u2022 ${entry.name}`}
                      {entry.level !== null && (
                        <Text colorRole="details">{` - ${t(proficiencyLevels[entry.level - 1]!)}`}</Text>
                      )}
                    </Text>
                  ))}
                </Section>
              )}
              {languages.length > 0 && (
                <Section section="languages" appearance={appearance}>
                  {languages.map((value, index) => (
                    <Text key={index} style={styles.body}>
                      {value}
                    </Text>
                  ))}
                </Section>
              )}
            </View>
            <View style={styles.main}>
              {summary.length > 0 && (
                <Section
                  section="summary"
                  appearance={appearance}
                  lead={<Text style={styles.body}>{summary[0]}</Text>}
                >
                  {summary.slice(1).map((line, index) => (
                    <Text key={index} style={styles.body}>
                      {line}
                    </Text>
                  ))}
                </Section>
              )}
              <Entries
                section="experience"
                entries={experience}
                appearance={appearance}
                bullets
              />
              <Entries
                section="projects"
                entries={projects}
                appearance={appearance}
                bullets
              />
              <Entries
                section="certifications"
                entries={certifications}
                appearance={appearance}
              />
              {referenceRows.length > 0 && (
                <Section
                  section="references"
                  appearance={appearance}
                  lead={referenceRow(referenceRows[0]!)}
                >
                  {referenceRows.slice(1).map((row, index) => (
                    <View key={index}>{referenceRow(row)}</View>
                  ))}
                </Section>
              )}
            </View>
          </View>
          <Text
            fixed
            colorRole="details"
            style={styles.footer}
            render={({ pageNumber }) =>
              t('Page {page}').replace('{page}', String(pageNumber))
            }
          />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
