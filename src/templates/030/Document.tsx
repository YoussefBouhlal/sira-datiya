import { Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { diagonalTemplate } from './index'
import { createStyles } from './styles'

type RenderAppearance = Omit<TemplateProps['appearance'], 'accent'> & {
  accent: string
}

function Icon({ section, color }: { section: string; color: string }) {
  const paths: Record<string, string> = {
    education: 'm1 8 11-6 11 6-11 6ZM5 12v6l7 4 7-4v-6l-7 4ZM22 9v10',
    experience: 'M8 3h8v4h6v14H2V7h6Zm2 2v2h4V5ZM2 11v2h20v-2Z',
    details: 'M3 2h5l2 6-3 2c2 4 3 5 7 7l2-3 6 2v5C11 24 0 13 3 2Z',
    summary: 'M7 7a5 5 0 1 0 10 0 5 5 0 0 0-10 0ZM4 23v-5a8 6 0 0 1 16 0v5Z',
    skills: 'M1 9h3V4h4v5h8V4h4v5h3v6h-3v5h-4v-5H8v5H4v-5H1Z',
    references: 'M2 3q5-2 10 2 5-4 10-2v17q-5-2-10 2-5-4-10-2ZM12 5v17',
    email: 'M2 4h20v16H2ZM2 5l10 8L22 5',
    location:
      'M12 23S3 14 3 9a9 9 0 0 1 18 0c0 5-9 14-9 14ZM8 9a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',
  }
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d={paths[section] ?? 'M3 2h18v20H3ZM7 7h10M7 12h10M7 17h7'}
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  )
}

function Section({
  section,
  appearance,
  lead,
  children,
}: {
  section: SectionHeadingKey
  appearance: RenderAppearance
  lead?: ReactNode
  children?: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={18}>
        <View
          style={[
            styles.sectionHeading,
            { borderBottomColor: appearance.accent },
          ]}
        >
          <View style={styles.icon}>
            <Icon
              section={section}
              color={appearance.colors?.headings ?? '#626262'}
            />
          </View>
          <Text section={section} colorRole="headings" style={styles.heading}>
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
  appearance: RenderAppearance
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View
      wrap={false}
      minPresenceAhead={18}
      style={[
        styles.rail,
        styles.entryHeader,
        { borderLeftColor: appearance.accent },
      ]}
    >
      <View style={[styles.marker, { backgroundColor: appearance.accent }]} />
      {title.trim() && (
        <Text colorRole="headings" style={styles.title}>
          {title}
        </Text>
      )}
      <View style={styles.metadata}>
        <Text colorRole="details" style={styles.organization}>
          {organization}
        </Text>
        {dates && (
          <Text colorRole="details" style={styles.dates}>
            {dates}
          </Text>
        )}
      </View>
    </View>
  )
}

function EntryBody({
  text,
  appearance,
  children,
}: {
  text: string
  appearance: RenderAppearance
  children?: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View
      style={[
        styles.rail,
        styles.entryBody,
        { borderLeftColor: appearance.accent },
      ]}
    >
      {children}
      {text
        .split('\n')
        .filter((line) => line.trim())
        .map((line, index) => (
          <Text key={index} style={styles.body} orphans={2} widows={2}>
            {line}
          </Text>
        ))}
    </View>
  )
}

export function DiagonalDocument({
  cv,
  appearance: originalAppearance,
}: TemplateProps) {
  const appearance = {
    ...originalAppearance,
    accent:
      originalAppearance.colors?.accent ??
      (originalAppearance.accent === '#177568'
        ? '#6189b8'
        : originalAppearance.accent),
  }
  const styles = createStyles(appearance.fontSize)
  const colors = {
    ...effectiveColors(originalAppearance, diagonalTemplate.colorDefaults),
    accent: appearance.accent,
  }
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const width = appearance.pageSize === 'LETTER' ? 612 : 595.28
  const contacts = [
    { value: cv.personal.phone, icon: 'details' },
    { value: cv.personal.email, icon: 'email' },
    { value: cv.personal.location, icon: 'location' },
    { value: cv.personal.website, icon: 'link' },
    { value: cv.personal.linkedin, icon: 'link' },
  ].filter((entry) => entry.value.trim())
  const skills = cv.skills.filter((entry) => entry.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
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
  const projects = cv.projects.filter((entry) =>
    [entry.name, entry.url, entry.description].some((value) => value.trim()),
  )
  const certifications = cv.certifications.filter((value) => value.trim())
  const references = cv.references.filter((entry) =>
    [
      entry.name,
      entry.jobTitle,
      entry.organization,
      entry.phone,
      entry.email,
    ].some((value) => value.trim()),
  )
  const educationHeader = (entry: (typeof education)[number]) => (
    <EntryHeader
      title={entry.degree}
      organization={entry.school}
      dates={dates(entry.startDate, entry.endDate)}
      appearance={appearance}
    />
  )
  const experienceHeader = (entry: (typeof experience)[number]) => (
    <EntryHeader
      title={entry.role}
      organization={[entry.employer, entry.location].filter(Boolean).join(', ')}
      dates={dates(entry.startDate, entry.endDate, entry.current)}
      appearance={appearance}
    />
  )
  const reference = (entry: (typeof references)[number]) => (
    <View key={entry.id} wrap={false} style={styles.reference}>
      <Text colorRole="headings" style={styles.referenceName}>
        {entry.name}
      </Text>
      <Text colorRole="details" style={styles.body}>
        {[entry.organization, entry.jobTitle].filter(Boolean).join(' / ')}
      </Text>
      <ContactText values={[entry.phone]} style={styles.referenceContact} />
      <ContactText values={[entry.email]} style={styles.referenceContact} />
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
        headingDefaults={diagonalTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[styles.page, pageLanguageStyle(appearance.language)]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <Svg
            fixed
            width={width}
            height={230}
            viewBox={`0 0 ${width} 230`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Path
              d={`M0 0H${width * 0.39}L0 ${cv.personal.portrait ? 226 : 24}Z`}
              fill={colors.accent}
              transform={
                appearance.language === 'ar'
                  ? `translate(${width}, 0) scale(-1, 1)`
                  : undefined
              }
            />
          </Svg>
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              <View wrap={false} style={styles.identity}>
                {cv.personal.portrait && (
                  <Image src={cv.personal.portrait} style={styles.portrait} />
                )}
                <Text
                  colorRole="headings"
                  style={[styles.name, { color: colors.accent }]}
                >
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle.trim() && (
                  <Text colorRole="details" style={styles.jobTitle}>
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
              {contacts.length > 0 && (
                <Section section="details" appearance={appearance}>
                  {contacts.map((entry) => (
                    <View
                      key={entry.icon + entry.value}
                      style={styles.contactRow}
                    >
                      <View style={styles.icon}>
                        <Icon section={entry.icon} color={colors.accent} />
                      </View>
                      <View style={styles.contactValue}>
                        <ContactText
                          values={[entry.value]}
                          style={styles.contact}
                        />
                      </View>
                    </View>
                  ))}
                </Section>
              )}
              {cv.summary.trim() && (
                <Section
                  section="summary"
                  appearance={appearance}
                  lead={
                    <Text style={styles.body}>{cv.summary.split('\n')[0]}</Text>
                  }
                >
                  {cv.summary
                    .split('\n')
                    .slice(1)
                    .filter((line) => line.trim())
                    .map((line, index) => (
                      <Text key={index} style={styles.body}>
                        {line}
                      </Text>
                    ))}
                </Section>
              )}
              {skills.length > 0 && (
                <Section section="skills" appearance={appearance}>
                  {skills.map((entry) => (
                    <Text key={entry.id} style={styles.contact}>
                      {`\u2022 ${entry.name}`}
                      {entry.level !== null && (
                        <Text colorRole="details">{` - ${t(proficiencyLevels[entry.level - 1]!)}`}</Text>
                      )}
                    </Text>
                  ))}
                </Section>
              )}
              {languages.length > 0 && (
                <Section section="languages" appearance={appearance}>
                  {languages.map((value, index) => (
                    <Text
                      key={index}
                      style={styles.contact}
                    >{`\u2022 ${value}`}</Text>
                  ))}
                </Section>
              )}
            </View>
            <View style={styles.main}>
              {education.length > 0 && (
                <Section
                  section="education"
                  appearance={appearance}
                  lead={educationHeader(education[0]!)}
                >
                  {education.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && educationHeader(entry)}
                      <EntryBody
                        text={entry.description}
                        appearance={appearance}
                      />
                    </View>
                  ))}
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
                      <EntryBody
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
                  lead={
                    <EntryHeader
                      title={projects[0]!.name}
                      appearance={appearance}
                    />
                  }
                >
                  {projects.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && (
                        <EntryHeader
                          title={entry.name}
                          appearance={appearance}
                        />
                      )}
                      <EntryBody
                        text={entry.description}
                        appearance={appearance}
                      >
                        {entry.url.trim() && (
                          <ContactText
                            values={[entry.url]}
                            style={styles.body}
                          />
                        )}
                      </EntryBody>
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
                  lead={
                    <View style={styles.references}>
                      {references.slice(0, 2).map(reference)}
                    </View>
                  }
                >
                  <View style={styles.references}>
                    {references.slice(2).map(reference)}
                  </View>
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
