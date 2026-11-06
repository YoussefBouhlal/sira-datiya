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
import { framedTemplate } from './index'
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
      <View wrap={false} minPresenceAhead={28}>
        <Text section={section} colorRole="headings" style={styles.heading}>
          {heading(section)}
        </Text>
        <View
          style={[
            styles.underline,
            { backgroundColor: appearance.colors?.accent ?? appearance.accent },
          ]}
        />
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({
  title,
  location,
  dates,
  appearance,
}: {
  title: string
  location?: string
  dates?: string
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={22}>
      <View style={styles.titleRow}>
        {title && (
          <Text colorRole="headings" style={styles.entryTitle}>
            {title}
          </Text>
        )}
        {location && (
          <Text colorRole="details" style={styles.location}>
            {location}
          </Text>
        )}
      </View>
      {dates && (
        <Text colorRole="details" style={styles.dates}>
          {dates}
        </Text>
      )}
    </View>
  )
}

function Description({
  text,
  appearance,
}: {
  text: string
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <Text key={index} style={styles.description} orphans={2} widows={2}>
        {line}
      </Text>
    ))
}

export function FramedDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, framedTemplate.colorDefaults)
  const foreground = surfaceForeground(colors.surface)
  const sidebarColors = {
    headings: appearance.colors?.headings ?? foreground,
    details: appearance.colors?.details ?? foreground,
    body: appearance.colors?.body ?? foreground,
  }
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const mode = resolveSkillProficiencyDisplay(
    framedTemplate,
    appearance.skillProficiencyDisplay,
  )
  const contact = [
    ['Location', cv.personal.location],
    ['Phone', cv.personal.phone],
    ['Email', cv.personal.email],
    ['Website', cv.personal.website],
    ['LinkedIn', cv.personal.linkedin],
  ].filter(([, value]) => value!.trim())
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
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
  const experienceHeader = (entry: (typeof experience)[number]) => (
    <EntryHeader
      appearance={appearance}
      title={[entry.role, entry.employer].filter(Boolean).join(', ')}
      location={entry.location}
      dates={dates(entry.startDate, entry.endDate, entry.current)}
    />
  )
  const educationHeader = (entry: (typeof education)[number]) => (
    <EntryHeader
      appearance={appearance}
      title={[entry.degree, entry.school].filter(Boolean).join(', ')}
      dates={dates(entry.startDate, entry.endDate)}
    />
  )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <View wrap={false} minPresenceAhead={22}>
      <EntryHeader title={entry.name} appearance={appearance} />
      {entry.url.trim() && (
        <ContactText values={[entry.url]} style={styles.body} />
      )}
    </View>
  )
  const referenceEntry = (entry: (typeof references)[number]) => (
    <View wrap={false} style={styles.entry}>
      <EntryHeader
        appearance={appearance}
        title={[entry.name, entry.jobTitle, entry.organization]
          .filter(Boolean)
          .join(' - ')}
      />
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
        headingDefaults={framedTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 3 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <View
            wrap={false}
            style={[styles.header, { borderColor: colors.accent }]}
            minPresenceAhead={100}
          >
            {cv.personal.portrait && (
              <Image src={cv.personal.portrait} style={styles.portrait} />
            )}
            <View style={styles.identity}>
              <Text colorRole="headings" style={styles.name}>
                {cv.personal.fullName || t('Your name')}
              </Text>
              {cv.personal.jobTitle.trim() && (
                <Text colorRole="details" style={styles.jobTitle}>
                  {cv.personal.jobTitle}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.columns}>
            <PdfLanguage language={appearance.language} colors={sidebarColors}>
              <View style={styles.sidebar}>
                {contact.length > 0 && (
                  <Section section="details" appearance={appearance}>
                    {contact.map(([label, value]) => (
                      <View key={label} style={styles.contact} wrap={false}>
                        <Text colorRole="details" style={styles.contactLabel}>
                          {t(label!)}
                        </Text>
                        <View style={styles.contactValue}>
                          <ContactText
                            values={[value!]}
                            style={styles.sidebarBody}
                          />
                        </View>
                      </View>
                    ))}
                  </Section>
                )}
                {skills.length > 0 && (
                  <Section section="skills" appearance={appearance}>
                    {skills.map((skill) => (
                      <View key={skill.id} style={styles.skill}>
                        <View style={styles.skillRow}>
                          <Text
                            style={[styles.sidebarBody, styles.skillName]}
                            minPresenceAhead={skill.level === null ? 0 : 20}
                            orphans={2}
                            widows={2}
                          >
                            {skill.name}
                          </Text>
                          {skill.level !== null && mode === 'dots' && (
                            <View wrap={false} style={styles.dots}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <View
                                  key={level}
                                  style={[
                                    styles.dot,
                                    {
                                      borderColor: colors.accent,
                                      backgroundColor:
                                        level <= skill.level!
                                          ? colors.accent
                                          : colors.surface,
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
                                      backgroundColor: colors.accent,
                                    },
                                  ]}
                                />
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </Section>
                )}
                {languages.length > 0 && (
                  <Section section="languages" appearance={appearance}>
                    {languages.map((value, index) => (
                      <Text key={index} style={styles.sidebarBody}>
                        {value}
                      </Text>
                    ))}
                  </Section>
                )}
              </View>
            </PdfLanguage>
            <View style={styles.main}>
              {cv.summary.trim() && (
                <Section section="summary" appearance={appearance}>
                  <Text style={styles.body} orphans={2} widows={2}>
                    {cv.summary}
                  </Text>
                </Section>
              )}
              {experience.length > 0 && (
                <Section
                  section="experience"
                  appearance={appearance}
                  lead={experienceHeader(experience[0]!)}
                >
                  {experience.map((entry, index) => (
                    <View key={entry.id} style={styles.entry}>
                      {index > 0 && experienceHeader(entry)}
                      <Description
                        text={entry.description}
                        appearance={appearance}
                      />
                    </View>
                  ))}
                </Section>
              )}
              {education.length > 0 && (
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
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
