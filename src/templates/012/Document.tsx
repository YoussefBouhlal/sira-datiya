import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors, surfaceForeground } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import { resolveSkillProficiencyDisplay, type TemplateProps } from '../types'
import { charcoalTemplate } from './index'
import { createStyles } from './styles'

function Section({
  section,
  fontSize,
  lead,
  children,
}: {
  section: SectionHeadingKey
  fontSize: number
  lead?: ReactNode
  children?: ReactNode
}) {
  const styles = createStyles(fontSize)
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={24}>
        <Text section={section} colorRole="headings" style={styles.heading}>
          {heading(section)}
        </Text>
        {lead}
      </View>
      {children}
    </View>
  )
}

function Description({
  text,
  fontSize,
  bullets = false,
}: {
  text: string
  fontSize: number
  bullets?: boolean
}) {
  const styles = createStyles(fontSize)
  return text.split('\n').map((value, index) => {
    const line = value.trim()
    if (!line) return null
    const marked = /^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
    return (
      <Text key={index} style={styles.description} orphans={2} widows={2}>
        {bullets && !marked ? `\u2022 ${line}` : line}
      </Text>
    )
  })
}

export function CharcoalDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, charcoalTemplate.colorDefaults)
  const foreground = surfaceForeground(colors.surface)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
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
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const mode = resolveSkillProficiencyDisplay(
    charcoalTemplate,
    appearance.skillProficiencyDisplay,
  )
  const contact = [
    cv.personal.email,
    cv.personal.location,
    cv.personal.phone,
    cv.personal.website,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
  const entryHeader = (title: ReactNode, date: string) => (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={20}>
      <Text colorRole="headings" style={styles.entryTitle}>
        {title}
      </Text>
      {date && (
        <Text
          colorRole="details"
          style={[styles.dates, { color: colors.details }]}
        >
          {date}
        </Text>
      )}
    </View>
  )
  const experienceHeader = (entry: (typeof experience)[number]) =>
    entryHeader(
      <>
        {entry.role}
        <Text colorRole="details" style={{ color: colors.details }}>
          {`${entry.role && (entry.employer || entry.location) ? ', ' : ''}${[entry.employer, entry.location].filter(Boolean).join(', ')}`}
        </Text>
      </>,
      dates(entry.startDate, entry.endDate, entry.current),
    )
  const educationHeader = (entry: (typeof education)[number]) =>
    entryHeader(
      <>
        {entry.degree}
        {entry.school && (
          <Text
            colorRole="details"
            style={{ color: colors.details }}
          >{`${entry.degree ? ', ' : ''}${entry.school}`}</Text>
        )}
      </>,
      dates(entry.startDate, entry.endDate),
    )
  const skillRows = Array.from(
    { length: Math.ceil(skills.length / 2) },
    (_, index) => (
      <View key={index} wrap={false} style={styles.skillRow}>
        {skills.slice(index * 2, index * 2 + 2).map((skill) => (
          <View key={skill.id} style={styles.skill}>
            <Text style={styles.body}>
              {skill.name}
              {skill.level !== null && mode !== 'bar' && (
                <Text
                  colorRole="details"
                  style={{ color: colors.details }}
                >{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
              )}
            </Text>
            {skill.level !== null && mode !== 'text' && (
              <View style={styles.skillBar}>
                <View
                  style={[
                    styles.skillFill,
                    {
                      width: `${skill.level * 20}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    ),
  )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={20}>
      <Text colorRole="headings" style={styles.entryTitle}>
        {entry.name}
      </Text>
      {entry.url && (
        <ContactText
          values={[entry.url]}
          style={[styles.body, { color: colors.details }]}
        />
      )}
    </View>
  )
  const referenceHeader = (entry: (typeof references)[number]) => (
    <View wrap={false} style={styles.entry}>
      <Text colorRole="headings" style={styles.entryTitle}>
        {entry.name}
      </Text>
      <Text
        colorRole="details"
        style={[styles.body, { color: colors.details }]}
      >
        {[entry.jobTitle, entry.organization].filter(Boolean).join(', ')}
      </Text>
      <ContactText
        values={[entry.email, entry.phone]}
        style={[styles.body, { color: colors.details }]}
      />
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
        headingDefaults={charcoalTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[styles.page, pageLanguageStyle(appearance.language)]}
        >
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <PdfLanguage
              language={appearance.language}
              colors={{
                ...appearance.colors,
                body: foreground,
                headings: appearance.colors?.headings ?? foreground,
                details: appearance.colors?.details ?? foreground,
              }}
            >
              <View style={styles.identity}>
                {cv.personal.portrait && (
                  <Image src={cv.personal.portrait} style={styles.portrait} />
                )}
                <Text colorRole="headings" style={styles.name}>
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle && (
                  <Text colorRole="details" style={styles.jobTitle}>
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
              {contact.length > 0 && (
                <View
                  style={[styles.contacts, { borderTopColor: colors.accent }]}
                >
                  <ContactText
                    values={contact}
                    separator={'   \u00b7   '}
                    centered
                    style={styles.contact}
                  />
                </View>
              )}
            </PdfLanguage>
          </View>
          {cv.summary.trim() && (
            <Section section="summary" fontSize={appearance.fontSize}>
              <Text style={styles.body} orphans={2} widows={2}>
                {cv.summary}
              </Text>
            </Section>
          )}
          {experience.length > 0 && (
            <Section
              section="experience"
              fontSize={appearance.fontSize}
              lead={experienceHeader(experience[0]!)}
            >
              {experience.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && experienceHeader(entry)}
                  <Description
                    text={entry.description}
                    fontSize={appearance.fontSize}
                    bullets
                  />
                </View>
              ))}
            </Section>
          )}
          {education.length > 0 && (
            <Section
              section="education"
              fontSize={appearance.fontSize}
              lead={educationHeader(education[0]!)}
            >
              {education.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && educationHeader(entry)}
                  <Description
                    text={entry.description}
                    fontSize={appearance.fontSize}
                  />
                </View>
              ))}
            </Section>
          )}
          {skills.length > 0 && (
            <Section
              section="skills"
              fontSize={appearance.fontSize}
              lead={skillRows[0]}
            >
              {skillRows.slice(1)}
            </Section>
          )}
          {projects.length > 0 && (
            <Section
              section="projects"
              fontSize={appearance.fontSize}
              lead={projectHeader(projects[0]!)}
            >
              {projects.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && projectHeader(entry)}
                  <Description
                    text={entry.description}
                    fontSize={appearance.fontSize}
                  />
                </View>
              ))}
            </Section>
          )}
          {[
            {
              section: 'languages' as const,
              values: cv.languages.filter((value) => value.trim()),
            },
            {
              section: 'certifications' as const,
              values: cv.certifications.filter((value) => value.trim()),
            },
          ].map(({ section, values }) =>
            values.length > 0 ? (
              <Section
                key={section}
                section={section}
                fontSize={appearance.fontSize}
                lead={<Text style={styles.body}>{values[0]}</Text>}
              >
                {values.slice(1).map((value, index) => (
                  <Text key={index} style={styles.body}>
                    {value}
                  </Text>
                ))}
              </Section>
            ) : null,
          )}
          {references.length > 0 && (
            <Section
              section="references"
              fontSize={appearance.fontSize}
              lead={referenceHeader(references[0]!)}
            >
              {references.slice(1).map((entry) => (
                <View key={entry.id}>{referenceHeader(entry)}</View>
              ))}
            </Section>
          )}
          <Text
            colorRole="details"
            style={[styles.pageNumber, { color: colors.details }]}
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
