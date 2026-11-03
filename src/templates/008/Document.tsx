import { Circle, Document, Font, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { translate, dateRange as localizedDateRange } from '../../i18n/messages'
import { PdfLanguage, View, Image, ContactText } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import { PageNumber } from '../shared/content'
import { resolveSkillProficiencyDisplay, type TemplateProps } from '../types'
import headingFont from './assets/Oswald-Regular.ttf?url'
import { timelineTemplate } from './index'
import { styles } from './styles'

const nodeFontDirectory = './assets/'
Font.register({
  family: 'TimelineHeading',
  src:
    typeof window === 'undefined'
      ? `${decodeURIComponent(new URL(nodeFontDirectory, import.meta.url).pathname)}Oswald-Regular.ttf`
      : headingFont,
})

function SectionIcon({
  section,
  color,
}: {
  section: SectionHeadingKey
  color: string
}) {
  return (
    <View style={styles.icon}>
      <Svg width={13} height={13} viewBox="0 0 24 24">
        {section === 'summary' ? (
          <>
            <Circle cx="12" cy="7" r="4" fill={color} />
            <Path d="M4 22v-4a8 8 0 0 1 16 0v4Z" fill={color} />
          </>
        ) : section === 'education' ? (
          <>
            <Path d="m2 8 10-5 10 5-10 5Z" fill={color} />
            <Path d="M5 13v5l7 4 7-4v-5l-7 4Z" fill={color} />
          </>
        ) : (
          <>
            <Path d="M3 8h18v13H3Z" fill={color} />
            <Path d="M8 8V4h8v4" fill="none" stroke={color} strokeWidth={2} />
            <Path d="M3 13h18" stroke="#ffffff" strokeWidth={0.7} />
          </>
        )}
      </Svg>
    </View>
  )
}

function SectionHeading({
  section,
  appearance,
  sidebar = false,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
  sidebar?: boolean
}) {
  const { heading } = usePdfTranslation()
  const color = appearance.colors?.accent ?? appearance.accent
  return (
    <View
      style={[
        styles.sectionHeading,
        ...(sidebar ? [styles.sidebarHeading] : []),
      ]}
    >
      {sidebar ? (
        <View style={[styles.ornament, { borderColor: color }]} />
      ) : (
        <SectionIcon section={section} color={color} />
      )}
      <Text
        section={section}
        colorRole="headings"
        style={[styles.heading, { fontSize: appearance.fontSize + 0.5 }]}
      >
        {heading(section)}
      </Text>
      {sidebar && <View style={[styles.ornament, { borderColor: color }]} />}
    </View>
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
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={30}>
        <SectionHeading section={section} appearance={appearance} />
        {lead}
      </View>
      {children}
    </View>
  )
}

function TimelineHeader({
  title,
  dates,
  appearance,
}: {
  title: string
  dates?: string
  appearance: TemplateProps['appearance']
}) {
  const color = appearance.colors?.accent ?? appearance.accent
  return (
    <View
      wrap={false}
      minPresenceAhead={24}
      style={[styles.rail, styles.entryHeader, { borderLeftColor: color }]}
    >
      <View style={[styles.marker, { borderColor: color }]} />
      {title && (
        <Text
          colorRole="headings"
          style={[styles.entryTitle, { fontSize: appearance.fontSize }]}
        >
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

function TimelineBody({
  children,
  appearance,
}: {
  children: ReactNode
  appearance: TemplateProps['appearance']
}) {
  return (
    <View
      style={[
        styles.rail,
        styles.entryBody,
        { borderLeftColor: appearance.colors?.accent ?? appearance.accent },
      ]}
    >
      {children}
    </View>
  )
}

function Description({ text }: { text: string }) {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line, index) => (
      <Text key={index} style={styles.description} orphans={2} widows={2}>
        {line}
      </Text>
    ))
}

export function TimelineDocument({ cv, appearance }: TemplateProps) {
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const accent = appearance.colors?.accent ?? appearance.accent
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
    timelineTemplate,
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
    <TimelineHeader
      title={[entry.role, entry.employer, entry.location]
        .filter(Boolean)
        .join(' - ')}
      dates={dates(entry.startDate, entry.endDate, entry.current)}
      appearance={appearance}
    />
  )
  const educationHeader = (entry: (typeof education)[number]) => (
    <TimelineHeader
      title={[entry.degree, entry.school].filter(Boolean).join(', ')}
      dates={dates(entry.startDate, entry.endDate)}
      appearance={appearance}
    />
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
        headingDefaults={timelineTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 2 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={styles.header} minPresenceAhead={75}>
            {cv.personal.portrait && (
              <Image src={cv.personal.portrait} style={styles.portrait} />
            )}
            <Text
              colorRole="headings"
              style={[styles.name, { fontSize: appearance.fontSize * 2.5 }]}
            >
              {cv.personal.fullName || t('Your name')}
            </Text>
            {[
              cv.personal.jobTitle,
              cv.personal.location,
              cv.personal.phone,
            ].some((value) => value.trim()) && (
              <ContactText
                values={[
                  cv.personal.jobTitle,
                  cv.personal.location,
                  cv.personal.phone,
                ]}
                centered
                style={styles.subtitle}
              />
            )}
          </View>
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {contact.length > 0 && (
                <View style={styles.section}>
                  <View wrap={false} minPresenceAhead={24}>
                    <SectionHeading
                      section="details"
                      appearance={appearance}
                      sidebar
                    />
                    <ContactText
                      values={[contact[0]!]}
                      centered
                      style={styles.contact}
                    />
                  </View>
                  {contact.slice(1).map((value, index) => (
                    <ContactText
                      key={index}
                      values={[value]}
                      centered
                      style={styles.contact}
                    />
                  ))}
                </View>
              )}
              {skills.length > 0 && (
                <View style={styles.section}>
                  <View wrap={false} minPresenceAhead={50}>
                    <SectionHeading
                      section="skills"
                      appearance={appearance}
                      sidebar
                    />
                  </View>
                  {skills.map((skill) => (
                    <View key={skill.id} style={styles.skill}>
                      <Text
                        style={styles.skillName}
                        minPresenceAhead={skill.level === null ? 0 : 25}
                      >
                        {skill.name}
                      </Text>
                      {skill.level !== null && (
                        <View wrap={false}>
                          {mode !== 'bar' && (
                            <Text
                              colorRole="details"
                              style={[
                                styles.level,
                                { fontSize: appearance.fontSize - 3 },
                              ]}
                            >
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
                                    backgroundColor: accent,
                                    width: `${skill.level * 20}%`,
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
                <View style={styles.section}>
                  <View wrap={false} minPresenceAhead={24}>
                    <SectionHeading
                      section="languages"
                      appearance={appearance}
                      sidebar
                    />
                    <Text style={styles.contact}>{languages[0]}</Text>
                  </View>
                  {languages.slice(1).map((value, index) => (
                    <Text key={index} style={styles.contact}>
                      {value}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.main}>
              {cv.summary.trim() && (
                <Section section="summary" appearance={appearance}>
                  <TimelineBody appearance={appearance}>
                    <Description text={cv.summary} />
                  </TimelineBody>
                </Section>
              )}
              {experience.length > 0 && (
                <Section
                  section="experience"
                  appearance={appearance}
                  lead={experienceHeader(experience[0]!)}
                >
                  {experience.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && experienceHeader(entry)}
                      <TimelineBody appearance={appearance}>
                        <Description text={entry.description} />
                      </TimelineBody>
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
                    <View key={entry.id}>
                      {index > 0 && educationHeader(entry)}
                      <TimelineBody appearance={appearance}>
                        <Description text={entry.description} />
                      </TimelineBody>
                    </View>
                  ))}
                </Section>
              )}
              {projects.length > 0 && (
                <Section
                  section="projects"
                  appearance={appearance}
                  lead={
                    <TimelineHeader
                      title={projects[0]!.name}
                      appearance={appearance}
                    />
                  }
                >
                  {projects.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && (
                        <TimelineHeader
                          title={entry.name}
                          appearance={appearance}
                        />
                      )}
                      <TimelineBody appearance={appearance}>
                        {entry.url && (
                          <ContactText
                            values={[entry.url]}
                            style={styles.dates}
                          />
                        )}
                        <Description text={entry.description} />
                      </TimelineBody>
                    </View>
                  ))}
                </Section>
              )}
              {certifications.length > 0 && (
                <Section section="certifications" appearance={appearance}>
                  <TimelineBody appearance={appearance}>
                    {certifications.map((value, index) => (
                      <Text key={index} style={styles.description}>
                        {value}
                      </Text>
                    ))}
                  </TimelineBody>
                </Section>
              )}
              {references.length > 0 && (
                <Section
                  section="references"
                  appearance={appearance}
                  lead={
                    <TimelineHeader
                      title={references[0]!.name}
                      appearance={appearance}
                    />
                  }
                >
                  {references.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && (
                        <TimelineHeader
                          title={entry.name}
                          appearance={appearance}
                        />
                      )}
                      <TimelineBody appearance={appearance}>
                        <Text colorRole="details" style={styles.dates}>
                          {[entry.jobTitle, entry.organization]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                        <ContactText
                          values={[entry.email, entry.phone]}
                          style={styles.dates}
                        />
                      </TimelineBody>
                    </View>
                  ))}
                </Section>
              )}
            </View>
          </View>
          <PageNumber />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
