import { Document, Page } from '@react-pdf/renderer'
import { PdfLanguage, View, Image } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { PageNumber } from '../shared/content'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { styles } from './styles'

function Description({ text }: { text: string }) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <Text
        key={index}
        style={[
          styles.body,
          /^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
            ? styles.bullet
            : styles.description,
        ]}
        orphans={2}
        widows={2}
      >
        {line}
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
  const { t } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={70}>
        <Text
          colorRole="headings"
          style={[
            styles.heading,
            {
              color: appearance.accent,
              fontSize: appearance.fontSize * 1.2,
              ...(appearance.colors?.surface
                ? { backgroundColor: appearance.colors.surface }
                : {}),
              ...(appearance.colors?.accent
                ? { textDecorationColor: appearance.colors.accent }
                : {}),
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
  dates,
  location,
  fontSize,
  accent,
}: {
  title: ReactNode
  dates: string
  location?: string
  fontSize: number
  accent?: string
}) {
  return (
    <View style={styles.entryHeader} minPresenceAhead={35}>
      <View style={styles.titleRow}>
        <View
          style={[
            styles.marker,
            ...(accent ? [{ backgroundColor: accent }] : []),
          ]}
        />
        <Text
          colorRole="headings"
          style={[styles.entryTitle, { fontSize: fontSize * 1.1 }]}
        >
          {title}
        </Text>
        <View
          style={[
            styles.leader,
            ...(accent ? [{ borderBottomColor: accent }] : []),
          ]}
        />
        {dates && (
          <Text
            colorRole="details"
            style={[styles.dates, { fontSize: fontSize * 0.8 }]}
          >
            {dates}
          </Text>
        )}
      </View>
      {location && (
        <Text
          colorRole="details"
          style={[styles.location, { fontSize: fontSize * 0.75 }]}
        >
          {location}
        </Text>
      )}
    </View>
  )
}

export function TraditionalDocument({ cv, appearance }: TemplateProps) {
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
  const links = [cv.personal.website, cv.personal.linkedin]
    .filter(Boolean)
    .join(' | ')
  const ruleStyle = [
    styles.doubleRule,
    {
      borderTopColor: appearance.colors?.accent ?? appearance.accent,
      borderBottomColor: appearance.colors?.accent ?? appearance.accent,
    },
  ]
  const experienceHeader = (
    entry: TemplateProps['cv']['experience'][number],
  ) => (
    <EntryHeader
      title={
        <>
          {entry.role || entry.employer}
          {entry.role && entry.employer && (
            <Text
              colorRole="details"
              style={{ color: '#171717' }}
            >{` - ${entry.employer}`}</Text>
          )}
        </>
      }
      dates={dateRange(entry.startDate, entry.endDate, entry.current)}
      location={entry.location}
      fontSize={appearance.fontSize}
      accent={appearance.colors?.accent}
    />
  )
  const educationHeader = (entry: TemplateProps['cv']['education'][number]) => (
    <EntryHeader
      title={
        <>
          {entry.degree || entry.school}
          {entry.degree && entry.school && (
            <Text
              colorRole="details"
              style={{ color: '#171717' }}
            >{`, ${entry.school}`}</Text>
          )}
        </>
      }
      dates={dateRange(entry.startDate, entry.endDate)}
      fontSize={appearance.fontSize}
      accent={appearance.colors?.accent}
    />
  )

  return (
    <Document
      title={`${cv.personal.fullName || 'Untitled'} - CV`}
      author={cv.personal.fullName}
      creator="Sira Datiya CV"
      language={appearance.language}
    >
      <PdfLanguage language={appearance.language} colors={appearance.colors}>
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={styles.header}>
            {cv.personal.portrait && (
              <Image src={cv.personal.portrait} style={styles.portrait} />
            )}
            <Text
              colorRole="headings"
              style={[styles.name, { fontSize: appearance.fontSize * 2.1 }]}
            >
              {cv.personal.fullName || t('Your name')}
            </Text>
            {cv.personal.jobTitle && (
              <Text colorRole="details" style={styles.jobTitle}>
                {cv.personal.jobTitle}
              </Text>
            )}
            {cv.personal.location && (
              <Text colorRole="details" style={styles.contact}>
                {cv.personal.location}
              </Text>
            )}
            {(cv.personal.phone || cv.personal.email) && (
              <View style={styles.contactRow}>
                {cv.personal.phone && (
                  <Text colorRole="details" style={styles.phone}>
                    {cv.personal.phone}
                  </Text>
                )}
                {cv.personal.email && (
                  <Text colorRole="details" style={styles.email}>
                    {cv.personal.email}
                  </Text>
                )}
              </View>
            )}
            {links && (
              <Text colorRole="details" style={styles.links}>
                {links}
              </Text>
            )}
          </View>
          <View style={ruleStyle} />
          {cv.summary.trim() && (
            <Section title="Profile" appearance={appearance}>
              <Text style={styles.profile} orphans={2} widows={2}>
                {cv.summary}
              </Text>
              <View style={ruleStyle} />
            </Section>
          )}
          {experience.length > 0 && (
            <Section
              title="Experience"
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
            <Section title="Skills" appearance={appearance}>
              <Text style={styles.body} orphans={2} widows={2}>
                {skills.map((skill, index) => (
                  <Text key={skill.id}>
                    {index > 0 ? ' / ' : ''}
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
            <Section title="Languages" appearance={appearance}>
              <Text style={styles.body} orphans={2} widows={2}>
                {languages.join(' / ')}
              </Text>
            </Section>
          )}
          {projects.length > 0 && (
            <Section title="Projects" appearance={appearance}>
              {projects.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  {entry.name && (
                    <Text
                      colorRole="headings"
                      style={styles.additionalTitle}
                      minPresenceAhead={30}
                    >
                      {entry.name}
                    </Text>
                  )}
                  {entry.url && (
                    <Text colorRole="details" style={styles.body}>
                      {entry.url}
                    </Text>
                  )}
                  <Description text={entry.description} />
                </View>
              ))}
            </Section>
          )}
          {certifications.length > 0 && (
            <Section title="Certifications" appearance={appearance}>
              <Description text={certifications.join('\n')} />
            </Section>
          )}
          {references.length > 0 && (
            <Section title="References" appearance={appearance}>
              {references.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  <Text
                    colorRole="headings"
                    style={styles.additionalTitle}
                    minPresenceAhead={25}
                  >
                    {[entry.name, entry.jobTitle, entry.organization]
                      .filter(Boolean)
                      .join(' - ')}
                  </Text>
                  <Text colorRole="details" style={styles.body}>
                    {[entry.email, entry.phone].filter(Boolean).join(' | ')}
                  </Text>
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
