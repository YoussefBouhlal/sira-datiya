import { Document, Page, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { PageNumber, Portrait } from '../shared/content'
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
  accent,
  children,
  inline = false,
}: {
  title: string
  accent: string
  children: ReactNode
  inline?: boolean
}) {
  return (
    <View
      style={[
        styles.section,
        { borderTopColor: accent },
        ...(inline ? [styles.row] : []),
      ]}
    >
      <Text
        style={[styles.heading, ...(inline ? [styles.rail] : [])]}
        minPresenceAhead={40}
      >
        {title}
      </Text>
      {inline ? <View style={styles.content}>{children}</View> : children}
    </View>
  )
}

export function ClassicDocument({ cv, appearance }: TemplateProps) {
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
  const projects = cv.projects.filter((entry) =>
    [entry.name, entry.url, entry.description].some((value) => value.trim()),
  )
  const certifications = cv.certifications.filter((value) => value.trim())
  const references = cv.references.filter((entry) =>
    [
      entry.name,
      entry.jobTitle,
      entry.organization,
      entry.email,
      entry.phone,
    ].some((value) => value.trim()),
  )
  const contact = [cv.personal.location, cv.personal.phone, cv.personal.email]
    .filter(Boolean)
    .join(', ')
  const links = [cv.personal.website, cv.personal.linkedin]
    .filter(Boolean)
    .join(', ')

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
          <Portrait cv={cv} />
          <Text style={[styles.name, { fontSize: appearance.fontSize * 1.4 }]}>
            {[cv.personal.fullName || 'Your name', cv.personal.jobTitle]
              .filter(Boolean)
              .join(', ')}
          </Text>
          {contact && <Text style={styles.contact}>{contact}</Text>}
          {links && <Text style={styles.contact}>{links}</Text>}
        </View>
        {cv.summary.trim() && (
          <Section title="Profile" accent={appearance.accent} inline>
            <Text style={styles.body} orphans={2} widows={2}>
              {cv.summary}
            </Text>
          </Section>
        )}
        {experience.length > 0 && (
          <Section title="Experience" accent={appearance.accent}>
            {experience.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text
                  style={[
                    styles.dates,
                    { fontSize: appearance.fontSize * 0.8 },
                  ]}
                  minPresenceAhead={35}
                >
                  {dateRange(entry.startDate, entry.endDate, entry.current)}
                </Text>
                <View style={styles.content}>
                  <View style={styles.entryHeader} minPresenceAhead={30}>
                    <Text
                      style={[
                        styles.entryTitle,
                        { fontSize: appearance.fontSize * 1.2 },
                      ]}
                    >
                      {[entry.role, entry.employer]
                        .filter(Boolean)
                        .join(' \u2014 ')}
                    </Text>
                    {entry.location && (
                      <Text
                        style={[
                          styles.location,
                          { fontSize: appearance.fontSize * 0.8 },
                        ]}
                      >
                        {entry.location}
                      </Text>
                    )}
                  </View>
                  <Description text={entry.description} />
                </View>
              </View>
            ))}
          </Section>
        )}
        {education.length > 0 && (
          <Section title="Education" accent={appearance.accent}>
            {education.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text
                  style={[
                    styles.dates,
                    { fontSize: appearance.fontSize * 0.8 },
                  ]}
                  minPresenceAhead={35}
                >
                  {dateRange(entry.startDate, entry.endDate)}
                </Text>
                <View style={styles.content}>
                  <View style={styles.entryHeader} minPresenceAhead={30}>
                    <Text
                      style={[
                        styles.entryTitle,
                        { fontSize: appearance.fontSize * 1.2 },
                      ]}
                    >
                      {entry.degree || entry.school}
                    </Text>
                    {entry.degree && entry.school && (
                      <Text
                        style={[
                          styles.location,
                          { fontSize: appearance.fontSize * 0.8 },
                        ]}
                      >
                        {entry.school}
                      </Text>
                    )}
                  </View>
                  <Description text={entry.description} />
                </View>
              </View>
            ))}
          </Section>
        )}
        {skills.length > 0 && (
          <Section title="Skills" accent={appearance.accent}>
            <Text style={styles.body} orphans={2} widows={2}>
              {skills
                .map((skill) =>
                  skill.level === null
                    ? skill.name
                    : `${skill.name} (${proficiencyLevels[skill.level - 1]})`,
                )
                .join(' / ')}
            </Text>
          </Section>
        )}
        {languages.length > 0 && (
          <Section title="Languages" accent={appearance.accent} inline>
            <View style={styles.languages}>
              {languages.map((language, index) => (
                <Text
                  key={index}
                  style={styles.language}
                  orphans={2}
                  widows={2}
                >
                  {language}
                </Text>
              ))}
            </View>
          </Section>
        )}
        {projects.length > 0 && (
          <Section title="Projects" accent={appearance.accent}>
            {projects.map((entry) => (
              <View key={entry.id} style={styles.additionalEntry}>
                {entry.name && (
                  <Text style={styles.additionalTitle} minPresenceAhead={30}>
                    {entry.name}
                  </Text>
                )}
                {entry.url && <Text style={styles.body}>{entry.url}</Text>}
                <Description text={entry.description} />
              </View>
            ))}
          </Section>
        )}
        {certifications.length > 0 && (
          <Section title="Certifications" accent={appearance.accent}>
            <Description text={certifications.join('\n')} />
          </Section>
        )}
        {references.length > 0 && (
          <Section title="References" accent={appearance.accent}>
            {references.map((entry) => (
              <View key={entry.id} style={styles.additionalEntry}>
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
