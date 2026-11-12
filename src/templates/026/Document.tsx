import { Circle, Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { plumTemplate } from './index'
import { createStyles } from './styles'

function SectionIcon({ section }: { section: SectionHeadingKey }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24">
      {section === 'summary' ? (
        <>
          <Circle cx="12" cy="6" r="5" fill="#ffffff" />
          <Path d="M3 23v-3a9 9 0 0 1 18 0v3Z" fill="#ffffff" />
        </>
      ) : section === 'education' ? (
        <Path d="m1 7 11-6 11 6-11 6ZM5 12v6l7 4 7-4v-6l-7 4Z" fill="#ffffff" />
      ) : section === 'projects' || section === 'experience' ? (
        <Path
          d="M8 2h8v4h6v15H2V6h6Zm2 4h4V4h-4ZM2 11v2h20v-2Z"
          fill="#ffffff"
        />
      ) : (
        <Path d="m12 1 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z" fill="#ffffff" />
      )}
    </Svg>
  )
}

function Section({
  section,
  appearance,
  sidebar = false,
  lead,
  children,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
  sidebar?: boolean
  lead?: ReactNode
  children: ReactNode
}) {
  const styles = createStyles(appearance.fontSize, appearance.colors?.accent)
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={22}>
        <View style={styles.sectionHeading}>
          {!sidebar && (
            <View
              style={[
                styles.icon,
                {
                  backgroundColor:
                    appearance.colors?.accent ?? appearance.accent,
                },
              ]}
            >
              <SectionIcon section={section} />
            </View>
          )}
          <Text section={section} colorRole="headings" style={styles.heading}>
            {heading(section)}
          </Text>
        </View>
        {lead}
      </View>
      {children}
    </View>
  )
}

type Entry = {
  id: string
  title: string
  organization?: string
  dates?: string
  description?: string
  contacts?: string[]
}

function EntryHeader({
  entry,
  appearance,
}: {
  entry: Entry
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize, appearance.colors?.accent)
  return (
    <View
      wrap={false}
      minPresenceAhead={18}
      style={[styles.rail, styles.entryHeader]}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: appearance.colors?.accent ?? appearance.accent },
        ]}
      />
      <View style={styles.entryRow}>
        <Text colorRole="headings" style={styles.entryTitle}>
          {entry.title}
        </Text>
        {entry.dates && (
          <Text colorRole="details" style={styles.dates}>
            {entry.dates}
          </Text>
        )}
      </View>
      {entry.organization && (
        <Text colorRole="details" style={styles.organization}>
          {entry.organization}
        </Text>
      )}
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
  const styles = createStyles(appearance.fontSize, appearance.colors?.accent)
  if (!entries.length) return null
  return (
    <Section
      section={section}
      appearance={appearance}
      lead={<EntryHeader entry={entries[0]!} appearance={appearance} />}
    >
      {entries.map((entry, index) => (
        <View key={entry.id}>
          {index > 0 && <EntryHeader entry={entry} appearance={appearance} />}
          <View style={styles.rail}>
            {entry.contacts?.some(Boolean) && (
              <ContactText values={entry.contacts} style={styles.body} />
            )}
            {entry.description
              ?.split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, lineIndex) => (
                <Text
                  key={lineIndex}
                  style={styles.body}
                  orphans={2}
                  widows={2}
                >
                  {bullets && !/^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
                    ? `\u2022 ${line}`
                    : line}
                </Text>
              ))}
          </View>
        </View>
      ))}
    </Section>
  )
}

export function PlumDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize, appearance.colors?.accent)
  const colors = effectiveColors(appearance, plumTemplate.colorDefaults)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const contacts = [
    cv.personal.phone,
    cv.personal.email,
    cv.personal.location,
    cv.personal.website,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
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
  const references: Entry[] = cv.references
    .filter((entry) =>
      [
        entry.name,
        entry.jobTitle,
        entry.organization,
        entry.email,
        entry.phone,
      ].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.name,
      organization: [entry.jobTitle, entry.organization]
        .filter(Boolean)
        .join(', '),
      contacts: [entry.email, entry.phone],
    }))
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
        headingDefaults={plumTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[styles.page, pageLanguageStyle(appearance.language)]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {cv.personal.portrait && (
                <Image src={cv.personal.portrait} style={styles.portrait} />
              )}
              {contacts.length > 0 && (
                <Section
                  section="details"
                  appearance={appearance}
                  sidebar
                  lead={
                    <ContactText
                      values={[contacts[0]!]}
                      style={styles.contact}
                    />
                  }
                >
                  {contacts.slice(1).map((value, index) => (
                    <ContactText
                      key={index}
                      values={[value]}
                      style={styles.contact}
                    />
                  ))}
                </Section>
              )}
              {skills.length > 0 && (
                <Section section="skills" appearance={appearance} sidebar>
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
                <Section section="languages" appearance={appearance} sidebar>
                  {languages.map((value, index) => (
                    <Text
                      key={index}
                      style={styles.body}
                    >{`\u2022 ${value}`}</Text>
                  ))}
                </Section>
              )}
            </View>
            <View style={styles.main}>
              <View wrap={false} minPresenceAhead={45} style={styles.header}>
                <Text colorRole="headings" style={styles.name}>
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle.trim() && (
                  <Text colorRole="details" style={styles.jobTitle}>
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
              {summary.length > 0 && (
                <Section
                  section="summary"
                  appearance={appearance}
                  lead={
                    <View style={styles.rail}>
                      <Text style={styles.body}>{summary[0]}</Text>
                    </View>
                  }
                >
                  <View style={styles.rail}>
                    {summary.slice(1).map((line, index) => (
                      <Text key={index} style={styles.body}>
                        {line}
                      </Text>
                    ))}
                  </View>
                </Section>
              )}
              <Entries
                section="education"
                entries={education}
                appearance={appearance}
              />
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
              <Entries
                section="references"
                entries={references}
                appearance={appearance}
              />
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
