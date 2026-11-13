import { Document, Font, Page } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import scriptFont from './assets/Allura-Regular.ttf?url'
import { blushTemplate } from './index'
import { createStyles } from './styles'

const nodeFontDirectory = './assets/'
Font.register({
  family: 'BlushScript',
  src:
    typeof window === 'undefined'
      ? `${decodeURIComponent(new URL(nodeFontDirectory, import.meta.url).pathname)}Allura-Regular.ttf`
      : scriptFont,
})

function Section({
  section,
  appearance,
  sidebar = false,
  lead,
  children,
}: {
  section: SectionHeadingKey
  appearance: TemplateProps['appearance']
  sidebar?: boolean
  lead?: ReactNode
  children?: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  const { heading } = usePdfTranslation()
  const colors = effectiveColors(appearance, blushTemplate.colorDefaults)
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={18}>
        <View
          style={[
            styles.band,
            { backgroundColor: sidebar ? '#ffffff' : colors.surface },
          ]}
        >
          <Text
            section={section}
            colorRole="headings"
            style={[
              styles.heading,
              ...(sidebar ? [styles.sidebarHeading] : []),
            ]}
          >
            {heading(section)}
          </Text>
        </View>
        {lead}
      </View>
      {children}
    </View>
  )
}

function EntryHeader({
  title,
  organization,
  dates,
  appearance,
}: {
  title: string
  organization?: string
  dates?: string
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View wrap={false} minPresenceAhead={18} style={styles.entryHeader}>
      {title.trim() && (
        <Text colorRole="headings" style={styles.entryTitle}>
          {title}
        </Text>
      )}
      {organization?.trim() && (
        <Text colorRole="details" style={styles.organization}>
          {organization}
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

function Paragraphs({
  text,
  appearance,
}: {
  text: string
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line, index) => (
      <Text key={index} style={styles.body} orphans={2} widows={2}>
        {line}
      </Text>
    ))
}

export function BlushDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, blushTemplate.colorDefaults)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const contacts = [
    cv.personal.phone,
    cv.personal.email,
    cv.personal.website,
    cv.personal.linkedin,
    cv.personal.location,
  ].filter((value) => value.trim())
  const skills = cv.skills.filter((entry) => entry.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const experience = cv.experience.filter(
    (entry) =>
      entry.current ||
      [
        entry.role,
        entry.employer,
        entry.location,
        entry.startDate,
        entry.endDate,
        entry.description,
      ].some((value) => value.trim()),
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
      title={entry.role}
      organization={[entry.employer, entry.location].filter(Boolean).join(', ')}
      dates={dates(entry.startDate, entry.endDate, entry.current)}
      appearance={appearance}
    />
  )
  const educationHeader = (entry: (typeof education)[number]) => (
    <EntryHeader
      title={entry.degree}
      organization={entry.school}
      dates={dates(entry.startDate, entry.endDate)}
      appearance={appearance}
    />
  )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <EntryHeader title={entry.name} appearance={appearance} />
  )
  const referenceHeader = (entry: (typeof references)[number]) => (
    <EntryHeader
      title={entry.name}
      organization={[entry.jobTitle, entry.organization]
        .filter(Boolean)
        .join(', ')}
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
        headingDefaults={blushTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[styles.page, pageLanguageStyle(appearance.language)]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {cv.personal.portrait && (
                <View wrap={false} style={styles.portraitOuter}>
                  <View
                    style={[
                      styles.portraitInner,
                      { borderColor: colors.accent },
                    ]}
                  >
                    <Image src={cv.personal.portrait} style={styles.portrait} />
                  </View>
                </View>
              )}
              {cv.summary.trim() && (
                <Section
                  section="summary"
                  appearance={appearance}
                  sidebar
                  lead={
                    <Text style={styles.body}>{cv.summary.split('\n')[0]}</Text>
                  }
                >
                  <Paragraphs
                    text={cv.summary.split('\n').slice(1).join('\n')}
                    appearance={appearance}
                  />
                </Section>
              )}
              {contacts.length > 0 && (
                <Section
                  section="details"
                  appearance={appearance}
                  sidebar
                  lead={
                    <ContactText
                      values={[contacts[0]!]}
                      style={styles.contact}
                    />
                  }
                >
                  {contacts.slice(1).map((value, index) => (
                    <ContactText
                      key={index}
                      values={[value]}
                      style={styles.contact}
                    />
                  ))}
                </Section>
              )}
              {skills.length > 0 && (
                <Section section="skills" appearance={appearance} sidebar>
                  {skills.map((entry) => (
                    <Text key={entry.id} style={styles.body}>
                      {`\u2022 ${entry.name}`}
                      {entry.level !== null && (
                        <Text colorRole="details">{` - ${t(proficiencyLevels[entry.level - 1]!)}`}</Text>
                      )}
                    </Text>
                  ))}
                </Section>
              )}
              {languages.length > 0 && (
                <Section section="languages" appearance={appearance} sidebar>
                  {languages.map((value, index) => (
                    <Text
                      key={index}
                      style={styles.body}
                    >{`\u2022 ${value}`}</Text>
                  ))}
                </Section>
              )}
            </View>
            <View style={styles.main}>
              <View
                style={[
                  styles.header,
                  { minHeight: cv.personal.portrait ? 195 : 0 },
                ]}
                wrap={false}
                minPresenceAhead={35}
              >
                <Text colorRole="headings" style={styles.name}>
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle.trim() && (
                  <Text
                    colorRole="details"
                    style={[styles.jobTitle, { borderTopColor: colors.accent }]}
                  >
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
              {experience.length > 0 && (
                <Section
                  section="experience"
                  appearance={appearance}
                  lead={experienceHeader(experience[0]!)}
                >
                  {experience.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && experienceHeader(entry)}
                      <Paragraphs
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
                    <View key={entry.id}>
                      {index > 0 && educationHeader(entry)}
                      <Paragraphs
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
                    <View key={entry.id}>
                      {index > 0 && projectHeader(entry)}
                      {entry.url.trim() && (
                        <ContactText
                          values={[entry.url]}
                          style={styles.contact}
                        />
                      )}
                      <Paragraphs
                        text={entry.description}
                        appearance={appearance}
                      />
                    </View>
                  ))}
                </Section>
              )}
              {certifications.length > 0 && (
                <Section
                  section="certifications"
                  appearance={appearance}
                  lead={<Text style={styles.body}>{certifications[0]}</Text>}
                >
                  {certifications.slice(1).map((value, index) => (
                    <Text key={index} style={styles.body}>
                      {value}
                    </Text>
                  ))}
                </Section>
              )}
              {references.length > 0 && (
                <Section
                  section="references"
                  appearance={appearance}
                  lead={referenceHeader(references[0]!)}
                >
                  {references.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && referenceHeader(entry)}
                      <ContactText
                        values={[entry.email, entry.phone].filter(Boolean)}
                        style={styles.contact}
                      />
                    </View>
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
