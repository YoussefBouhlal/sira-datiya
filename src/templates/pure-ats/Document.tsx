import { Document, Page } from '@react-pdf/renderer'
import { PdfLanguage, View, Image, ContactText } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { styles } from './styles'

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
  children?: ReactNode
}) {
  const { t } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={30}>
        <Text
          style={[
            styles.heading,
            {
              borderBottomColor: appearance.accent,
              fontSize: appearance.fontSize * 1.15,
            },
          ]}
        >
          {t(title)}
        </Text>
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({
  title,
  detail,
  dates,
}: {
  title: string
  detail?: string
  dates?: string
}) {
  return (
    <View style={styles.entryHeader} minPresenceAhead={20}>
      {title && <Text style={styles.entryTitle}>{title}</Text>}
      {detail && <Text style={styles.body}>{detail}</Text>}
      {dates && <Text style={styles.body}>{dates}</Text>}
    </View>
  )
}

export function PureAtsDocument({ cv, appearance }: TemplateProps) {
  const t = (text: string) => translate(appearance.language, text)
  const dateRange = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
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
  const projects = cv.projects.filter((entry) =>
    [entry.name, entry.url, entry.description].some((value) => value.trim()),
  )
  const languages = cv.languages.filter((value) => value.trim())
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
  const contact = [
    cv.personal.location,
    cv.personal.email,
    cv.personal.phone,
    cv.personal.website,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
  const experienceHeader = (
    entry: TemplateProps['cv']['experience'][number],
  ) => (
    <EntryHeader
      title={[entry.role, entry.employer, entry.location]
        .filter(Boolean)
        .join(', ')}
      dates={dateRange(entry.startDate, entry.endDate, entry.current)}
    />
  )
  const educationHeader = (entry: TemplateProps['cv']['education'][number]) => (
    <EntryHeader
      title={entry.school || entry.degree}
      detail={entry.school ? entry.degree : ''}
      dates={dateRange(entry.startDate, entry.endDate)}
    />
  )
  const skillRow = (row: typeof skills) => (
    <View style={styles.skillRow}>
      {row.map((skill) => (
        <Text key={skill.id} style={styles.skill} orphans={2} widows={2}>
          {'\u2022 '}
          {skill.name}
          {skill.level !== null &&
            ` (${t(proficiencyLevels[skill.level - 1]!)})`}
        </Text>
      ))}
    </View>
  )
  const projectHeader = (entry: TemplateProps['cv']['projects'][number]) => (
    <EntryHeader title={entry.name} detail={entry.url} />
  )
  const referenceHeader = (
    entry: TemplateProps['cv']['references'][number],
  ) => (
    <EntryHeader
      title={[entry.name, entry.jobTitle, entry.organization]
        .filter(Boolean)
        .join(' - ')}
      detail={[entry.email, entry.phone].filter(Boolean).join(' | ')}
    />
  )

  return (
    <Document
      title={`${cv.personal.fullName || 'Untitled'} - CV`}
      author={cv.personal.fullName}
      creator="Sira Datiya CV"
      language={appearance.language}
    >
      <PdfLanguage language={appearance.language}>
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
                style={[styles.name, { fontSize: appearance.fontSize * 1.8 }]}
              >
                {cv.personal.fullName || t('Your name')}
              </Text>
              {cv.personal.jobTitle && (
                <Text style={styles.jobTitle}>{cv.personal.jobTitle}</Text>
              )}
              {contact.length > 0 && (
                <ContactText
                  values={contact}
                  style={[
                    styles.contact,
                    { fontSize: appearance.fontSize * 0.9 },
                  ]}
                />
              )}
            </View>
            {cv.personal.portrait && (
              <Image src={cv.personal.portrait} style={styles.portrait} />
            )}
          </View>
          {cv.summary.trim() && (
            <Section title="Profile" appearance={appearance}>
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
              title="Areas of Expertise"
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
          {[
            { title: 'Languages', values: languages },
            { title: 'Certifications', values: certifications },
          ].map(({ title, values }) =>
            values.length > 0 ? (
              <Section
                key={title}
                title={title}
                appearance={appearance}
                lead={<Description text={values[0]!} />}
              >
                {values.slice(1).map((value, index) => (
                  <Description key={index} text={value} />
                ))}
              </Section>
            ) : null,
          )}
          {references.length > 0 && (
            <Section
              title="References"
              appearance={appearance}
              lead={referenceHeader(references[0]!)}
            >
              {references.slice(1).map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  {referenceHeader(entry)}
                </View>
              ))}
            </Section>
          )}
          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber }) =>
              translate(appearance.language, 'Page {page}', {
                page: pageNumber,
              })
            }
          />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
