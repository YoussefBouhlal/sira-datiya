import { Document, Image, Page, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { PageNumber } from '../shared/content'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { styles } from './styles'

function dateRange(start: string, end: string, current = false) {
  const format = (value: string) => {
    if (!value) return ''
    const [year, month] = value.split('-').map(Number)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year!, month! - 1)))
  }
  return [format(start), current ? 'Present' : format(end)]
    .filter(Boolean)
    .join(' - ')
}

function Description({ text }: { text: string }) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <Text key={index} style={styles.bullet} orphans={2} widows={2}>
        {/^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
          ? line
          : `\u2022 ${line}`}
      </Text>
    ))
}

function Section({
  title,
  appearance,
  lead,
  children,
}: {
  title: string
  appearance: TemplateProps['appearance']
  lead?: ReactNode
  children: ReactNode
}) {
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={40}>
        <Text
          style={[
            styles.heading,
            {
              color: appearance.accent,
              borderTopColor: appearance.accent,
              borderBottomColor: appearance.accent,
              fontSize: appearance.fontSize * 1.15,
            },
          ]}
        >
          {title}
        </Text>
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({
  title,
  dates,
  metadata,
  fontSize,
}: {
  title: string
  dates: string
  metadata?: string
  fontSize: number
}) {
  return (
    <View style={styles.entryHeader} minPresenceAhead={25}>
      <View style={styles.titleRow}>
        <Text style={styles.entryTitle}>{title}</Text>
        {dates && (
          <Text style={[styles.dates, { fontSize: fontSize * 0.9 }]}>
            {dates}
          </Text>
        )}
      </View>
      {metadata && <Text style={styles.metadata}>{metadata}</Text>}
    </View>
  )
}

export function PrimeAtsDocument({ cv, appearance }: TemplateProps) {
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
  const skillRows = Array.from(
    { length: Math.ceil(skills.length / 4) },
    (_, index) => skills.slice(index * 4, index * 4 + 4),
  )
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
  const contact = [
    cv.personal.location,
    cv.personal.phone,
    cv.personal.email,
    cv.personal.website,
    cv.personal.linkedin,
  ]
    .filter(Boolean)
    .join(' | ')
  const experienceHeader = (
    entry: TemplateProps['cv']['experience'][number],
  ) => (
    <EntryHeader
      title={[entry.role, entry.employer].filter(Boolean).join(', ')}
      dates={dateRange(entry.startDate, entry.endDate, entry.current)}
      metadata={entry.location}
      fontSize={appearance.fontSize}
    />
  )
  const educationHeader = (entry: TemplateProps['cv']['education'][number]) => (
    <EntryHeader
      title={entry.degree || entry.school}
      dates={dateRange(entry.startDate, entry.endDate)}
      metadata={entry.degree ? entry.school : ''}
      fontSize={appearance.fontSize}
    />
  )
  const skillRow = (row: typeof skills) => (
    <View style={styles.skillRow}>
      {row.map((skill) => (
        <Text key={skill.id} style={styles.skill} orphans={2} widows={2}>
          {skill.level === null
            ? skill.name
            : `${skill.name} (${proficiencyLevels[skill.level - 1]})`}
        </Text>
      ))}
    </View>
  )
  const projectHeader = (entry: TemplateProps['cv']['projects'][number]) => (
    <>
      {entry.name && (
        <Text style={styles.additionalTitle} minPresenceAhead={25}>
          {entry.name}
        </Text>
      )}
      {entry.url && <Text style={styles.body}>{entry.url}</Text>}
    </>
  )

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
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text
              style={[
                styles.name,
                {
                  color: appearance.accent,
                  fontSize: appearance.fontSize * 2.3,
                },
              ]}
            >
              {cv.personal.fullName || 'Your name'}
            </Text>
            {cv.personal.jobTitle && (
              <Text
                style={[
                  styles.jobTitle,
                  { fontSize: appearance.fontSize * 1.45 },
                ]}
              >
                {cv.personal.jobTitle}
              </Text>
            )}
            {contact && (
              <Text
                style={[
                  styles.contact,
                  { fontSize: appearance.fontSize * 0.9 },
                ]}
              >
                {contact}
              </Text>
            )}
          </View>
          {cv.personal.portrait && (
            <Image src={cv.personal.portrait} style={styles.portrait} />
          )}
        </View>
        {cv.summary.trim() && (
          <Section title="Summary" appearance={appearance}>
            <Text style={styles.body} orphans={2} widows={2}>
              {cv.summary}
            </Text>
          </Section>
        )}
        {experience.length > 0 && (
          <Section
            title="Professional Experience"
            appearance={appearance}
            lead={experienceHeader(experience[0]!)}
          >
            {experience.map((entry, index) => (
              <View key={entry.id} style={styles.entry}>
                {index > 0 && experienceHeader(entry)}
                <Description text={entry.description} />
              </View>
            ))}
          </Section>
        )}
        {education.length > 0 && (
          <Section
            title="Education"
            appearance={appearance}
            lead={educationHeader(education[0]!)}
          >
            {education.map((entry, index) => (
              <View key={entry.id} style={styles.entry}>
                {index > 0 && educationHeader(entry)}
                <Description text={entry.description} />
              </View>
            ))}
          </Section>
        )}
        {skills.length > 0 && (
          <Section
            title="Technical Skills"
            appearance={appearance}
            lead={skillRow(skillRows[0]!)}
          >
            {skillRows.slice(1).map((row, index) => (
              <View key={index}>{skillRow(row)}</View>
            ))}
          </Section>
        )}
        {projects.length > 0 && (
          <Section
            title="Projects"
            appearance={appearance}
            lead={projectHeader(projects[0]!)}
          >
            {projects.map((entry, index) => (
              <View key={entry.id} style={styles.entry}>
                {index > 0 && projectHeader(entry)}
                <Description text={entry.description} />
              </View>
            ))}
          </Section>
        )}
        {(languages.length > 0 || certifications.length > 0) && (
          <Section title="Additional Information" appearance={appearance}>
            {languages.length > 0 && (
              <Text style={styles.bullet} orphans={2} widows={2}>
                {'\u2022 '}
                <Text style={styles.additionalTitle}>Languages: </Text>
                {languages.join(', ')}
              </Text>
            )}
            {certifications.length > 0 && (
              <Text style={styles.bullet} orphans={2} widows={2}>
                {'\u2022 '}
                <Text style={styles.additionalTitle}>Certifications: </Text>
                {certifications.join(', ')}
              </Text>
            )}
          </Section>
        )}
        {references.length > 0 && (
          <Section title="References" appearance={appearance}>
            {references.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.additionalTitle} minPresenceAhead={25}>
                  {[entry.name, entry.jobTitle, entry.organization]
                    .filter(Boolean)
                    .join(' - ')}
                </Text>
                <Text style={styles.body}>
                  {[entry.email, entry.phone].filter(Boolean).join(' | ')}
                </Text>
              </View>
            ))}
          </Section>
        )}
        <PageNumber />
      </Page>
    </Document>
  )
}
