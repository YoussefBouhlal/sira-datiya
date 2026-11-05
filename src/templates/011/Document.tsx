import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { sageTemplate } from './index'
import { styles } from './styles'

function Description({ text, accent }: { text: string; accent: string }) {
  return text.split('\n').map((value, index) => {
    const line = value.trim()
    if (!line) return null
    const marked = /^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
    return (
      <View key={index} style={styles.bulletRow}>
        {!marked && (
          <Text style={[styles.marker, { color: accent }]}>{'\u2022'}</Text>
        )}
        <Text style={styles.bulletText} orphans={2} widows={2}>
          {line}
        </Text>
      </View>
    )
  })
}

function Section({
  title,
  fontSize,
  lead,
  children,
}: {
  title: SectionHeadingKey
  fontSize: number
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
            {
              color: sageTemplate.colorDefaults.headings,
              fontSize: fontSize * 2,
            },
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

export function SageDocument({ cv, appearance }: TemplateProps) {
  const colors = effectiveColors(appearance, sageTemplate.colorDefaults)
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
  const contactRows = [
    [cv.personal.email, cv.personal.phone],
    [cv.personal.location],
    [cv.personal.website],
    [cv.personal.linkedin],
  ]
    .map((row) => row.filter((value) => value.trim()))
    .filter((row) => row.length)
  const experienceHeader = (entry: (typeof experience)[number]) => (
    <View style={styles.entryHeader} minPresenceAhead={20}>
      <View style={styles.entryIdentity}>
        <Text
          colorRole="headings"
          style={[styles.entryTitle, { color: colors.headings }]}
        >
          {entry.role}
          {entry.employer && (
            <Text
              colorRole="details"
              style={{ color: colors.details }}
            >{`${entry.role ? ` ${t('at')} ` : ''}${entry.employer}`}</Text>
          )}
          {entry.location && (
            <Text
              colorRole="details"
              style={{ color: colors.details }}
            >{`${entry.role || entry.employer ? ', ' : ''}${entry.location}`}</Text>
          )}
        </Text>
      </View>
      <Text
        colorRole="details"
        style={[styles.dates, { color: colors.details }]}
      >
        {dateRange(entry.startDate, entry.endDate, entry.current)}
      </Text>
    </View>
  )
  const educationHeader = (entry: (typeof education)[number]) => (
    <View style={styles.educationHeader} minPresenceAhead={16}>
      <Text
        colorRole="headings"
        style={[styles.entryTitle, { color: colors.headings }]}
      >
        {entry.degree}
        <Text colorRole="details" style={{ color: colors.details }}>
          {`${entry.degree && (entry.startDate || entry.endDate) ? ', ' : ''}${dateRange(entry.startDate, entry.endDate)}`}
        </Text>
      </Text>
      {entry.school && (
        <Text colorRole="details" style={styles.body}>
          {entry.school}
        </Text>
      )}
    </View>
  )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <View style={styles.entryHeader}>
      <View style={styles.entryIdentity}>
        <Text
          colorRole="headings"
          style={[styles.entryTitle, { color: colors.headings }]}
        >
          {entry.name}
        </Text>
        {entry.url && <ContactText values={[entry.url]} style={styles.body} />}
      </View>
    </View>
  )
  const referenceHeader = (entry: (typeof references)[number]) => (
    <View style={styles.entry}>
      <Text
        colorRole="headings"
        style={[styles.entryTitle, { color: colors.headings }]}
      >
        {entry.name}
      </Text>
      {[entry.jobTitle, entry.organization].some(Boolean) && (
        <Text colorRole="details" style={styles.body}>
          {[entry.jobTitle, entry.organization].filter(Boolean).join(', ')}
        </Text>
      )}
      {[entry.email, entry.phone].some(Boolean) && (
        <ContactText values={[entry.email, entry.phone]} style={styles.body} />
      )}
    </View>
  )
  const skillText = (skill: (typeof skills)[number]) => (
    <Text style={styles.body}>
      {skill.name}
      {skill.level !== null && (
        <Text
          colorRole="details"
          style={{ color: colors.details }}
        >{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
      )}
    </Text>
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
        headingDefaults={sageTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <View style={styles.identity}>
              {cv.personal.portrait && (
                <Image src={cv.personal.portrait} style={styles.portrait} />
              )}
              <Text
                colorRole="headings"
                style={[styles.name, { fontSize: appearance.fontSize * 2.4 }]}
              >
                {cv.personal.fullName || t('Your name')}
              </Text>
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
                      { fontSize: appearance.fontSize * 0.85 },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          {cv.personal.jobTitle && (
            <Text
              colorRole="details"
              style={[
                styles.jobTitle,
                { fontSize: appearance.fontSize * 1.25 },
              ]}
            >
              {cv.personal.jobTitle}
            </Text>
          )}
          {cv.summary.trim() && (
            <Text style={styles.summary} orphans={2} widows={2}>
              {cv.summary}
            </Text>
          )}
          {experience.length > 0 && (
            <Section
              title="experience"
              fontSize={appearance.fontSize}
              lead={experienceHeader(experience[0]!)}
            >
              {experience.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && experienceHeader(entry)}
                  <Description
                    text={entry.description}
                    accent={colors.accent}
                  />
                </View>
              ))}
            </Section>
          )}
          {education.length > 0 && (
            <Section
              title="education"
              fontSize={appearance.fontSize}
              lead={educationHeader(education[0]!)}
            >
              {education.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && educationHeader(entry)}
                  <Description
                    text={entry.description}
                    accent={colors.accent}
                  />
                </View>
              ))}
            </Section>
          )}
          {skills.length > 0 && (
            <Section
              title="skills"
              fontSize={appearance.fontSize}
              lead={skillText(skills[0]!)}
            >
              {skills.slice(1).map((skill) => (
                <View key={skill.id}>{skillText(skill)}</View>
              ))}
            </Section>
          )}
          {projects.length > 0 && (
            <Section
              title="projects"
              fontSize={appearance.fontSize}
              lead={projectHeader(projects[0]!)}
            >
              {projects.map((entry, index) => (
                <View key={entry.id} style={styles.entry}>
                  {index > 0 && projectHeader(entry)}
                  <Description
                    text={entry.description}
                    accent={colors.accent}
                  />
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
              title="references"
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
