import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import { resolveSkillProficiencyDisplay, type TemplateProps } from '../types'
import { numberedTemplate } from './index'
import { createStyles } from './styles'

function Section({
  section,
  number,
  appearance,
  lead,
  children,
}: {
  section: SectionHeadingKey
  number: number
  appearance: TemplateProps['appearance']
  lead?: ReactNode
  children: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  const { heading } = usePdfTranslation()
  return (
    <>
      <View wrap={false} minPresenceAhead={24}>
        <View style={styles.headingRow}>
          <View
            style={[
              styles.circle,
              { borderColor: appearance.colors?.accent ?? appearance.accent },
            ]}
          >
            <Text colorRole="headings" style={styles.number}>
              {number}
            </Text>
          </View>
          <Text section={section} colorRole="headings" style={styles.heading}>
            {heading(section)}
          </Text>
        </View>
        {lead}
      </View>
      {children}
      <View style={styles.section} />
    </>
  )
}

type Entry = {
  id: string
  title: string
  subtitle: string
  dates: string
  description: string
}

function EntryHeader({
  item,
  appearance,
}: {
  item: Entry
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={24}>
      {item.title && (
        <Text colorRole="headings" style={styles.body}>
          {item.title}
        </Text>
      )}
      {item.subtitle && (
        <Text colorRole="details" style={styles.subtitle}>
          {item.subtitle}
        </Text>
      )}
      {item.dates && (
        <Text colorRole="details" style={styles.dates}>
          {item.dates}
        </Text>
      )}
    </View>
  )
}

function EntryLead({
  entries,
  appearance,
}: {
  entries: readonly Entry[]
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View style={styles.entryRow}>
      {entries.slice(0, 2).map((item) => (
        <View key={item.id} style={styles.column}>
          <EntryHeader item={item} appearance={appearance} />
        </View>
      ))}
      {entries.length === 1 && <View style={styles.column} />}
    </View>
  )
}

function EntryGrid({
  entries,
  appearance,
}: {
  entries: readonly Entry[]
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return entries
    .filter((_, index) => index % 2 === 0)
    .map((entry, index) => (
      <View key={entry.id} style={styles.entryRow}>
        {entries.slice(index * 2, index * 2 + 2).map((item) => (
          <View key={item.id} style={styles.column}>
            {index > 0 && <EntryHeader item={item} appearance={appearance} />}
            {item.description
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, lineIndex) => (
                <Text
                  key={lineIndex}
                  style={styles.description}
                  orphans={2}
                  widows={2}
                >
                  {/^(?:[-*\u2022\u25cf\u25aa]|\d+[.)])\s/.test(line)
                    ? line
                    : `\u2022 ${line}`}
                </Text>
              ))}
          </View>
        ))}
        {entries.length === index * 2 + 1 && <View style={styles.column} />}
      </View>
    ))
}

export function NumberedDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const t = (value: string) => translate(appearance.language, value)
  const accent = appearance.colors?.accent ?? appearance.accent
  const mode = resolveSkillProficiencyDisplay(
    numberedTemplate,
    appearance.skillProficiencyDisplay,
  )
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const experience = cv.experience
    .filter(
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
    .map((entry) => ({
      id: entry.id,
      title: entry.role,
      subtitle: [entry.employer, entry.location].filter(Boolean).join(', '),
      dates: dateRange(
        entry.startDate,
        entry.endDate,
        entry.current,
        appearance.language,
      ),
      description: entry.description,
    }))
  const education = cv.education
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
      subtitle: entry.school,
      dates: dateRange(
        entry.startDate,
        entry.endDate,
        false,
        appearance.language,
      ),
      description: entry.description,
    }))
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
  const sections: [SectionHeadingKey, boolean][] = [
    ['summary', !!cv.summary.trim()],
    ['skills', skills.length > 0],
    ['languages', languages.length > 0],
    ['experience', experience.length > 0],
    ['education', education.length > 0],
    ['projects', projects.length > 0],
    ['certifications', certifications.length > 0],
    ['references', references.length > 0],
  ]
  const visible = sections
    .filter(([, populated]) => populated)
    .map(([key]) => key)
  const section = (
    key: SectionHeadingKey,
    children: ReactNode,
    lead?: ReactNode,
  ) => (
    <Section
      section={key}
      number={visible.indexOf(key) + 1}
      appearance={appearance}
      lead={lead}
    >
      {children}
    </Section>
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
        headingDefaults={numberedTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 1 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={styles.header} wrap={false} minPresenceAhead={70}>
            <View style={styles.identity}>
              <Text
                colorRole="headings"
                style={[
                  styles.name,
                  appearance.language === 'ar' ? { alignSelf: 'flex-end' } : {},
                ]}
              >
                {cv.personal.fullName || t('Your name')}
              </Text>
              <View>
                {!!cv.personal.jobTitle.trim() && (
                  <Text colorRole="details" style={styles.jobTitle}>
                    {cv.personal.jobTitle}
                  </Text>
                )}
                <View style={styles.contacts}>
                  <View style={styles.contactColumn}>
                    <ContactText
                      values={[cv.personal.location]}
                      style={styles.body}
                    />
                  </View>
                  <View style={styles.contactColumn}>
                    {[
                      cv.personal.phone,
                      cv.personal.email,
                      cv.personal.website,
                      cv.personal.linkedin,
                    ]
                      .filter((value) => value.trim())
                      .map((value) => (
                        <ContactText
                          key={value}
                          values={[value]}
                          style={styles.body}
                        />
                      ))}
                  </View>
                </View>
              </View>
            </View>
            {cv.personal.portrait && (
              <Image src={cv.personal.portrait} style={styles.portrait} />
            )}
          </View>
          {!!cv.summary.trim() &&
            section(
              'summary',
              <View style={styles.summary}>
                <Text style={styles.body} orphans={2} widows={2}>
                  {cv.summary}
                </Text>
              </View>,
            )}
          {(skills.length > 0 || languages.length > 0) && (
            <View style={styles.pair}>
              {skills.length > 0 && (
                <View style={styles.column}>
                  {section(
                    'skills',
                    skills.map((skill) => (
                      <View key={skill.id} style={styles.skill}>
                        <View style={styles.skillRow}>
                          <Text
                            style={[styles.body, styles.skillName]}
                            minPresenceAhead={skill.level === null ? 0 : 14}
                          >
                            {skill.name}
                          </Text>
                          {skill.level !== null && mode === 'dots' && (
                            <View style={styles.dots} wrap={false}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <View
                                  key={level}
                                  style={[
                                    styles.dot,
                                    {
                                      borderColor: accent,
                                      backgroundColor:
                                        level <= skill.level!
                                          ? accent
                                          : '#ffffff',
                                    },
                                  ]}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                        {skill.level !== null && mode !== 'dots' && (
                          <View wrap={false}>
                            {mode !== 'bar' && (
                              <Text colorRole="details" style={styles.level}>
                                {t(proficiencyLevels[skill.level - 1]!)}
                              </Text>
                            )}
                            {mode !== 'text' && (
                              <>
                                <View style={styles.track} />
                                <View
                                  style={[
                                    styles.fill,
                                    {
                                      width: `${skill.level * 20}%`,
                                      backgroundColor: accent,
                                    },
                                  ]}
                                />
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    )),
                  )}
                </View>
              )}
              {languages.length > 0 && (
                <View style={styles.column}>
                  {section(
                    'languages',
                    languages.map((value, index) => (
                      <Text key={index} style={styles.body}>
                        {value}
                      </Text>
                    )),
                  )}
                </View>
              )}
            </View>
          )}
          {experience.length > 0 &&
            section(
              'experience',
              <EntryGrid entries={experience} appearance={appearance} />,
              <EntryLead entries={experience} appearance={appearance} />,
            )}
          {education.length > 0 &&
            section(
              'education',
              <EntryGrid entries={education} appearance={appearance} />,
              <EntryLead entries={education} appearance={appearance} />,
            )}
          {projects.length > 0 &&
            section(
              'projects',
              projects.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  <View wrap={false} minPresenceAhead={24}>
                    <Text colorRole="headings" style={styles.body}>
                      {entry.name}
                    </Text>
                    {!!entry.url.trim() && (
                      <ContactText values={[entry.url]} style={styles.body} />
                    )}
                  </View>
                  {!!entry.description.trim() && (
                    <Text style={styles.body} orphans={2} widows={2}>
                      {entry.description}
                    </Text>
                  )}
                </View>
              )),
            )}
          {certifications.length > 0 &&
            section(
              'certifications',
              certifications.map((value, index) => (
                <Text key={index} style={styles.body}>
                  {value}
                </Text>
              )),
            )}
          {references.length > 0 &&
            section(
              'references',
              references.map((entry) => (
                <View key={entry.id} style={styles.entry} wrap={false}>
                  <Text colorRole="headings" style={styles.body}>
                    {entry.name}
                  </Text>
                  <Text colorRole="details" style={styles.body}>
                    {[entry.jobTitle, entry.organization]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                  <ContactText
                    values={[entry.email, entry.phone]}
                    style={styles.body}
                  />
                </View>
              )),
            )}
          <Text
            colorRole="details"
            style={styles.footer}
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
