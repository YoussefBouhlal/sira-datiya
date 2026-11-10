import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { editorialTemplate } from './index'
import { createStyles } from './styles'

type Entry = {
  id: string
  title: string
  detail: string
  dates: string
  description: string
}

function Section({
  section,
  appearance,
  children,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
  children: ReactNode
}) {
  const { heading } = usePdfTranslation()
  const styles = createStyles(appearance.fontSize)
  return (
    <View style={styles.section}>
      <Text
        section={section}
        colorRole="headings"
        style={styles.heading}
        minPresenceAhead={65}
      >
        {heading(section)}
      </Text>
      {children}
    </View>
  )
}

function Entries({
  entries,
  appearance,
  section,
}: {
  entries: readonly Entry[]
  appearance: TemplateProps['appearance']
  section: SectionHeadingKey
}) {
  const { heading } = usePdfTranslation()
  const styles = createStyles(appearance.fontSize)
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={24}>
        <Text section={section} colorRole="headings" style={styles.heading}>
          {heading(section)}
        </Text>
        <View
          style={{
            width: '39%',
            paddingRight: 22,
            alignSelf: appearance.language === 'ar' ? 'flex-end' : 'flex-start',
          }}
        >
          {!!entries[0]?.title && (
            <Text colorRole="headings" style={styles.entryTitle}>
              {entries[0].title}
            </Text>
          )}
        </View>
      </View>
      {entries.map((entry, entryIndex) => (
        <View key={entry.id} style={styles.entry}>
          <View style={styles.entryIdentity}>
            {!!entry.title && entryIndex > 0 && (
              <Text colorRole="headings" style={styles.entryTitle}>
                {entry.title}
              </Text>
            )}
            {!!entry.detail && (
              <Text colorRole="details" style={styles.detail}>
                {entry.detail}
              </Text>
            )}
            {!!entry.dates && (
              <Text colorRole="details" style={styles.detail}>
                {entry.dates}
              </Text>
            )}
          </View>
          <View style={styles.description}>
            {entry.description
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, index) => (
                <Text key={index} style={styles.bullet} orphans={2} widows={2}>
                  {/^(?:[-*\u2022\u25cf\u25aa]|\d+[.)])\s/.test(line)
                    ? line
                    : `\u2022 ${line}`}
                </Text>
              ))}
          </View>
        </View>
      ))}
    </View>
  )
}

export function EditorialDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const t = (value: string) => translate(appearance.language, value)
  const accent = appearance.colors?.accent ?? appearance.accent
  const paragraphs = cv.summary
    .trim()
    .split(/\n\s*\n/)
    .filter((value) => value.trim())
  const skills = cv.skills.filter((skill) => skill.name.trim())
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
      title: [entry.role, entry.employer, entry.location]
        .filter(Boolean)
        .join(', '),
      detail: '',
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
      detail: entry.school,
      dates: dateRange(
        entry.startDate,
        entry.endDate,
        false,
        appearance.language,
      ),
      description: entry.description,
    }))
  const projects = cv.projects
    .filter((entry) =>
      [entry.name, entry.url, entry.description].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: entry.name,
      detail: entry.url,
      dates: '',
      description: entry.description,
    }))
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
        headingDefaults={editorialTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View
            style={[
              styles.intro,
              {
                backgroundColor:
                  appearance.colors?.surface ??
                  editorialTemplate.colorDefaults.surfaceColor,
              },
            ]}
          >
            <View style={styles.header}>
              {!!cv.personal.portrait && (
                <Image src={cv.personal.portrait} style={styles.portrait} />
              )}
              <View style={styles.headerText}>
                <View style={styles.identityRow}>
                  <View style={styles.identity}>
                    <Text colorRole="headings" style={styles.name}>
                      {cv.personal.fullName || t('Your name')}
                    </Text>
                    {!!cv.personal.jobTitle && (
                      <Text colorRole="details" style={styles.jobTitle}>
                        {cv.personal.jobTitle}
                      </Text>
                    )}
                  </View>
                  {[
                    cv.personal.email,
                    cv.personal.phone,
                    cv.personal.website,
                    cv.personal.linkedin,
                  ].some((value) => value.trim()) && (
                    <View style={styles.contacts}>
                      {[
                        cv.personal.email,
                        cv.personal.phone,
                        cv.personal.website,
                        cv.personal.linkedin,
                      ]
                        .filter((value) => value.trim())
                        .map((value) => (
                          <ContactText
                            key={value}
                            values={[value]}
                            style={styles.contact}
                          />
                        ))}
                    </View>
                  )}
                </View>
                <View style={[styles.location, { borderTopColor: accent }]}>
                  {!!cv.personal.location && (
                    <ContactText
                      values={[cv.personal.location]}
                      style={styles.detail}
                    />
                  )}
                </View>
              </View>
            </View>
            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={
                  index === 0 ? styles.lead : [styles.body, styles.summary]
                }
                orphans={2}
                widows={2}
              >
                {paragraph}
              </Text>
            ))}
            {skills.length > 0 && (
              <View style={styles.skills}>
                <SkillHeading appearance={appearance} />
                {Array.from(
                  { length: Math.ceil(skills.length / 3) },
                  (_, index) => (
                    <View key={index} style={styles.skillRow}>
                      {skills.slice(index * 3, index * 3 + 3).map((skill) => (
                        <View key={skill.id} style={styles.skill}>
                          <View
                            style={[styles.dash, { backgroundColor: accent }]}
                          />
                          <Text style={styles.skillText} orphans={2} widows={2}>
                            {skill.name}
                            {skill.level !== null && (
                              <Text colorRole="details">{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
                            )}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ),
                )}
              </View>
            )}
          </View>
          {experience.length > 0 && (
            <Entries
              section="experience"
              entries={experience}
              appearance={appearance}
            />
          )}
          {education.length > 0 && (
            <Entries
              section="education"
              entries={education}
              appearance={appearance}
            />
          )}
          {projects.length > 0 && (
            <Entries
              section="projects"
              entries={projects}
              appearance={appearance}
            />
          )}
          {certifications.length > 0 && (
            <Section section="certifications" appearance={appearance}>
              {certifications.map((value, index) => (
                <Text key={index} style={styles.body}>
                  {value}
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
          {references.length > 0 && (
            <Section section="references" appearance={appearance}>
              {references.map((entry) => (
                <View key={entry.id} style={{ marginBottom: 14 }}>
                  <Text
                    colorRole="headings"
                    style={styles.entryTitle}
                    minPresenceAhead={24}
                  >
                    {entry.name}
                  </Text>
                  <Text colorRole="details" style={styles.detail}>
                    {[entry.jobTitle, entry.organization]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                  <ContactText
                    values={[entry.email, entry.phone]}
                    style={styles.body}
                  />
                </View>
              ))}
            </Section>
          )}
          <Text
            colorRole="details"
            fixed
            style={styles.footer}
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

function SkillHeading({
  appearance,
}: {
  appearance: TemplateProps['appearance']
}) {
  const { heading } = usePdfTranslation()
  return (
    <Text
      section="skills"
      colorRole="headings"
      style={createStyles(appearance.fontSize).heading}
      minPresenceAhead={30}
    >
      {heading('skills')}
    </Text>
  )
}
