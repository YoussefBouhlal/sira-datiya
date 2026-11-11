import { Document, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { folioTemplate } from './index'
import { createStyles } from './styles'

function Section({
  section,
  appearance,
  lead,
  children,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
  lead?: ReactNode
  children: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
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
  appearance,
  bullets = false,
}: {
  text: string
  appearance: TemplateProps['appearance']
  bullets?: boolean
}) {
  const styles = createStyles(appearance.fontSize)
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <Text key={index} style={styles.description} orphans={2} widows={2}>
        {bullets && !/^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
          ? `\u2022 ${line}`
          : line}
      </Text>
    ))
}

export function FolioDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const rule = appearance.colors?.accent ?? appearance.accent
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const contacts = [
    cv.personal.phone,
    cv.personal.linkedin,
    cv.personal.email,
    cv.personal.location,
    cv.personal.website,
  ].filter((value) => value.trim())
  const education = cv.education.filter((entry) =>
    [
      entry.degree,
      entry.school,
      entry.startDate,
      entry.endDate,
      entry.description,
    ].some((value) => value.trim()),
  )
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
  const educationHeader = (entry: (typeof education)[number]) => (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={18}>
      {entry.degree.trim() && (
        <Text colorRole="headings" style={styles.entryTitle}>
          {entry.degree}
        </Text>
      )}
      {entry.school.trim() && (
        <Text colorRole="details" style={styles.secondary}>
          {entry.school}
        </Text>
      )}
      {(entry.startDate || entry.endDate) && (
        <Text colorRole="details" style={styles.secondary}>
          {dates(entry.startDate, entry.endDate)}
        </Text>
      )}
    </View>
  )
  const workHeader = (entry: (typeof experience)[number]) => (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={22}>
      <Text colorRole="headings" style={styles.entryTitle}>
        {entry.role}
        <Text colorRole="details" style={styles.secondary}>
          {`  ${[entry.employer, entry.location, dates(entry.startDate, entry.endDate, entry.current)].filter(Boolean).join(' | ')}`}
        </Text>
      </Text>
    </View>
  )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={22}>
      {entry.name.trim() && (
        <Text colorRole="headings" style={styles.entryTitle}>
          {entry.name}
        </Text>
      )}
      {entry.url.trim() && (
        <ContactText values={[entry.url]} style={styles.secondary} />
      )}
    </View>
  )
  const referenceEntry = (entry: (typeof references)[number]) => (
    <View wrap={false} style={styles.entry}>
      <Text colorRole="headings" style={styles.entryTitle}>
        {entry.name}
      </Text>
      <Text colorRole="details" style={styles.secondary}>
        {[entry.jobTitle, entry.organization].filter(Boolean).join(', ')}
      </Text>
      <ContactText values={[entry.email, entry.phone]} style={styles.body} />
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
        headingDefaults={folioTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 2 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={styles.header}>
            <View style={styles.identity}>
              <View wrap={false} style={styles.identityRow}>
                {cv.personal.portrait && (
                  <Image src={cv.personal.portrait} style={styles.portrait} />
                )}
                <View style={styles.identityText}>
                  <Text colorRole="headings" style={styles.name}>
                    {cv.personal.fullName || t('Your name')}
                  </Text>
                  {cv.personal.jobTitle.trim() && (
                    <Text
                      colorRole="details"
                      style={[styles.jobTitle, { borderTopColor: rule }]}
                    >
                      {cv.personal.jobTitle}
                    </Text>
                  )}
                </View>
              </View>
              {contacts.length > 0 && (
                <View style={styles.contacts}>
                  {contacts.map((value, index) => (
                    <View key={index} style={styles.contact}>
                      <ContactText
                        values={[value]}
                        style={styles.contactText}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
            {cv.summary.trim() && (
              <View style={[styles.profile, { borderLeftColor: rule }]}>
                <Section section="summary" appearance={appearance}>
                  <Text style={styles.body} orphans={2} widows={2}>
                    {cv.summary}
                  </Text>
                </Section>
              </View>
            )}
          </View>
          <View style={[styles.divider, { borderBottomColor: rule }]} />
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {education.length > 0 && (
                <View style={[styles.sidebarRule, { borderBottomColor: rule }]}>
                  <Section
                    section="education"
                    appearance={appearance}
                    lead={educationHeader(education[0]!)}
                  >
                    {education.map((entry, index) => (
                      <View key={entry.id} style={styles.entry}>
                        {index > 0 && educationHeader(entry)}
                        <Description
                          text={entry.description}
                          appearance={appearance}
                        />
                      </View>
                    ))}
                  </Section>
                </View>
              )}
              {skills.length > 0 && (
                <View style={[styles.sidebarRule, { borderBottomColor: rule }]}>
                  <Section section="skills" appearance={appearance}>
                    {skills.map((skill) => (
                      <View key={skill.id} wrap={false} style={styles.skill}>
                        <Text style={styles.body}>{skill.name}</Text>
                        {skill.level !== null && (
                          <Text colorRole="details" style={styles.secondary}>
                            {t(proficiencyLevels[skill.level - 1]!)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </Section>
                </View>
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
            </View>
            <View style={[styles.main, { borderLeftColor: rule }]}>
              {experience.length > 0 && (
                <Section
                  section="experience"
                  appearance={appearance}
                  lead={workHeader(experience[0]!)}
                >
                  {experience.map((entry, index) => (
                    <View key={entry.id} style={styles.entry}>
                      {index > 0 && workHeader(entry)}
                      <Description
                        text={entry.description}
                        appearance={appearance}
                        bullets
                      />
                    </View>
                  ))}
                </Section>
              )}
              {projects.length > 0 && (
                <Section
                  section="projects"
                  appearance={appearance}
                  lead={projectHeader(projects[0]!)}
                >
                  {projects.map((entry, index) => (
                    <View key={entry.id} style={styles.entry}>
                      {index > 0 && projectHeader(entry)}
                      <Description
                        text={entry.description}
                        appearance={appearance}
                      />
                    </View>
                  ))}
                </Section>
              )}
              {certifications.length > 0 && (
                <Section section="certifications" appearance={appearance}>
                  <Description
                    text={certifications.join('\n')}
                    appearance={appearance}
                  />
                </Section>
              )}
              {references.length > 0 && (
                <Section
                  section="references"
                  appearance={appearance}
                  lead={referenceEntry(references[0]!)}
                >
                  {references.slice(1).map((entry) => (
                    <View key={entry.id}>{referenceEntry(entry)}</View>
                  ))}
                </Section>
              )}
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
