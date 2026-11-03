import { Document, Font, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors, surfaceForeground } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import { resolveSkillProficiencyDisplay, type TemplateProps } from '../types'
import headingFont from './assets/Oswald-Regular.ttf?url'
import { columnarTemplate } from './index'
import { createStyles } from './styles'

const nodeFontDirectory = './assets/'
Font.register({
  family: 'ColumnarHeading',
  src:
    typeof window === 'undefined'
      ? `${decodeURIComponent(new URL(nodeFontDirectory, import.meta.url).pathname)}Oswald-Regular.ttf`
      : headingFont,
})

function Heading({
  section,
  appearance,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  const { heading } = usePdfTranslation()
  return (
    <Text
      section={section}
      colorRole="headings"
      style={[styles.heading, { fontSize: appearance.fontSize + 2 }]}
    >
      {heading(section)}
    </Text>
  )
}

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
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={28}>
        <Heading section={section} appearance={appearance} />
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({
  title,
  dates,
  appearance,
}: {
  title: string
  dates?: string
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={22}>
      {title && (
        <Text colorRole="headings" style={styles.entryTitle}>
          {title}
        </Text>
      )}
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
  bullets = false,
  appearance,
}: {
  text: string
  bullets?: boolean
  appearance: TemplateProps['appearance']
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

export function ColumnarDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const backgroundColor = effectiveColors(
    appearance,
    columnarTemplate.colorDefaults,
  ).surface
  const foreground = surfaceForeground(backgroundColor)
  const contact = [
    cv.personal.location,
    cv.personal.phone,
    cv.personal.email,
    cv.personal.website,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const mode = resolveSkillProficiencyDisplay(
    columnarTemplate,
    appearance.skillProficiencyDisplay,
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
      title={[entry.role, entry.employer, entry.location]
        .filter(Boolean)
        .join(', ')}
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
        headingDefaults={columnarTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 2 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View fixed style={[styles.background, { backgroundColor }]} />
          <View style={styles.columns}>
            <View style={styles.main}>
              <View wrap={false} style={styles.header} minPresenceAhead={65}>
                {cv.personal.portrait && (
                  <Image src={cv.personal.portrait} style={styles.portrait} />
                )}
                <View style={styles.identity}>
                  <Text
                    colorRole="headings"
                    style={[styles.name, { fontSize: appearance.fontSize * 2 }]}
                  >
                    {cv.personal.fullName || t('Your name')}
                  </Text>
                  {cv.personal.jobTitle.trim() && (
                    <Text colorRole="details" style={styles.jobTitle}>
                      {cv.personal.jobTitle}
                    </Text>
                  )}
                </View>
              </View>
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
                        bullets
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
            <PdfLanguage
              language={appearance.language}
              colors={{
                headings: foreground,
                details: foreground,
                body: foreground,
              }}
            >
              <View
                style={[
                  styles.sidebar,
                  { fontSize: appearance.fontSize - 3, color: foreground },
                ]}
              >
                {contact.length > 0 && (
                  <View style={styles.sidebarSection}>
                    <View wrap={false} minPresenceAhead={25}>
                      <Heading section="details" appearance={appearance} />
                    </View>
                    {contact.map((value, index) => (
                      <ContactText
                        key={index}
                        values={[value]}
                        style={styles.contact}
                      />
                    ))}
                  </View>
                )}
                {skills.length > 0 && (
                  <View style={styles.sidebarSection}>
                    <View wrap={false} minPresenceAhead={30}>
                      <Heading section="skills" appearance={appearance} />
                    </View>
                    {skills.map((skill) => (
                      <View key={skill.id} style={styles.skill}>
                        <Text
                          style={styles.sidebarBody}
                          minPresenceAhead={skill.level === null ? 0 : 20}
                          orphans={2}
                          widows={2}
                        >
                          {skill.name}
                        </Text>
                        {skill.level !== null && (
                          <View wrap={false}>
                            {mode !== 'bar' && (
                              <Text colorRole="details" style={styles.level}>
                                {t(proficiencyLevels[skill.level - 1]!)}
                              </Text>
                            )}
                            {mode !== 'text' && (
                              <>
                                <View
                                  style={[
                                    styles.track,
                                    { backgroundColor: foreground },
                                  ]}
                                />
                                <View
                                  style={[
                                    styles.fill,
                                    {
                                      width: `${skill.level * 20}%`,
                                      backgroundColor:
                                        appearance.colors?.accent ?? foreground,
                                    },
                                  ]}
                                />
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {languages.length > 0 && (
                  <View style={styles.sidebarSection}>
                    <View wrap={false} minPresenceAhead={25}>
                      <Heading section="languages" appearance={appearance} />
                    </View>
                    {languages.map((value, index) => (
                      <Text key={index} style={styles.contact}>
                        {value}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </PdfLanguage>
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
