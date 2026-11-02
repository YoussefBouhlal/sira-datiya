import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { PdfLanguage, View, Image, ContactText } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { executiveTemplate } from './index'
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
  title: SectionHeadingKey
  appearance: TemplateProps['appearance']
  lead: ReactNode
  children?: ReactNode
}) {
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={24}>
        <Text
          section={title}
          colorRole="headings"
          style={[
            styles.heading,
            { color: appearance.accent, fontSize: appearance.fontSize * 1.7 },
          ]}
        >
          {heading(title)}
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
  accent,
  neutralDetail = false,
}: {
  title: string
  detail?: string
  dates?: string
  accent: string
  neutralDetail?: boolean
}) {
  return (
    <View style={styles.entryHeader} minPresenceAhead={20}>
      <View style={styles.entryIdentity}>
        {title && (
          <Text colorRole="headings" style={[styles.body, { color: accent }]}>
            {title}
          </Text>
        )}
        {detail && (
          <Text
            colorRole="details"
            style={[styles.body, { color: neutralDetail ? '#222222' : accent }]}
          >
            {detail}
          </Text>
        )}
      </View>
      {dates && (
        <Text colorRole="details" style={[styles.dates, { color: accent }]}>
          {dates}
        </Text>
      )}
    </View>
  )
}

export function ExecutiveDocument({ cv, appearance }: TemplateProps) {
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
    { length: Math.ceil(skills.length / 3) },
    (_, index) => skills.slice(index * 3, index * 3 + 3),
  )
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
  const contactRows = [
    [cv.personal.email, cv.personal.phone],
    [cv.personal.location],
    [cv.personal.website],
    [cv.personal.linkedin],
  ]
    .map((row) => row.filter((value) => value.trim()))
    .filter((row) => row.length > 0)
  const experienceHeader = (
    entry: TemplateProps['cv']['experience'][number],
  ) => (
    <EntryHeader
      title={
        [entry.employer, entry.location].filter(Boolean).join(', ') ||
        entry.role
      }
      detail={entry.employer || entry.location ? entry.role : ''}
      dates={dateRange(entry.startDate, entry.endDate, entry.current)}
      accent={appearance.accent}
    />
  )
  const educationHeader = (entry: TemplateProps['cv']['education'][number]) => (
    <EntryHeader
      title={entry.degree || entry.school}
      detail={entry.degree ? entry.school : ''}
      dates={dateRange(entry.startDate, entry.endDate)}
      accent={appearance.accent}
      neutralDetail
    />
  )
  const skillRow = (row: typeof skills) => (
    <View style={styles.skillRow} wrap={false}>
      {row.map((skill) => (
        <View key={skill.id} style={styles.skill}>
          <View
            style={[
              styles.skillMarker,
              {
                backgroundColor: appearance.colors?.accent ?? appearance.accent,
              },
            ]}
          />
          <Text style={styles.skillText}>
            {skill.name}
            {skill.level !== null && (
              <Text
                colorRole="details"
                style={{ color: appearance.accent }}
              >{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
            )}
          </Text>
        </View>
      ))}
    </View>
  )
  const projectHeader = (entry: TemplateProps['cv']['projects'][number]) => (
    <EntryHeader
      title={entry.name}
      detail={entry.url}
      accent={appearance.accent}
    />
  )
  const referenceHeader = (
    entry: TemplateProps['cv']['references'][number],
  ) => (
    <View style={styles.entryHeader}>
      <View style={styles.entryIdentity}>
        <Text
          colorRole="headings"
          style={[styles.body, { color: appearance.accent }]}
        >
          {entry.name}
        </Text>
        {[entry.jobTitle, entry.organization].filter(Boolean).length > 0 && (
          <Text
            colorRole="details"
            style={[styles.body, { color: appearance.accent }]}
          >
            {[entry.jobTitle, entry.organization].filter(Boolean).join(', ')}
          </Text>
        )}
        {[entry.email, entry.phone].some(Boolean) && (
          <ContactText
            values={[entry.email, entry.phone]}
            style={[styles.body, { color: appearance.accent }]}
          />
        )}
      </View>
    </View>
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
        headingDefaults={executiveTemplate.headings}
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
              {cv.personal.portrait && (
                <Image src={cv.personal.portrait} style={styles.portrait} />
              )}
              <View style={styles.identityText}>
                <Text
                  colorRole="headings"
                  style={[
                    styles.name,
                    {
                      color: appearance.accent,
                      fontSize: appearance.fontSize * 2.2,
                    },
                  ]}
                >
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle && (
                  <Text
                    colorRole="details"
                    style={[styles.jobTitle, { color: appearance.accent }]}
                  >
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
            </View>
            {contactRows.length > 0 && (
              <View style={styles.contacts}>
                {contactRows.map((values, index) => (
                  <ContactText
                    key={index}
                    values={values}
                    separator={' \u00b7 '}
                    style={[
                      styles.contact,
                      {
                        color: appearance.accent,
                        fontSize: appearance.fontSize * 0.9,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          {cv.summary.trim() && (
            <Text style={styles.summary} orphans={2} widows={2}>
              {cv.summary}
            </Text>
          )}
          {experience.length > 0 && (
            <Section
              title="experience"
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
              title="education"
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
              title="skills"
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
              title="projects"
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
            {
              title: 'languages' as const,
              values: cv.languages.filter((value) => value.trim()),
            },
            {
              title: 'certifications' as const,
              values: cv.certifications.filter((value) => value.trim()),
            },
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
              title="references"
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
            colorRole="details"
            style={[styles.pageNumber, { color: appearance.accent }]}
            fixed
            render={({ pageNumber, totalPages }) =>
              `${translate(appearance.language, 'Page {page}', { page: pageNumber })} | ${totalPages}`
            }
          />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
