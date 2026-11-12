import { Circle, Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors, surfaceForeground } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { silhouetteTemplate } from './index'
import { createStyles } from './styles'

function SectionIcon({
  section,
  color,
}: {
  section: SectionHeadingKey
  color: string
}) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      {section === 'summary' ? (
        <>
          <Circle cx="12" cy="6" r="5" fill={color} />
          <Path d="M2 23v-3a10 9 0 0 1 20 0v3Z" fill={color} />
        </>
      ) : section === 'education' ? (
        <Path d="m1 7 11-6 11 6-11 6ZM5 12v6l7 4 7-4v-6l-7 4Z" fill={color} />
      ) : section === 'experience' || section === 'projects' ? (
        <Path d="M8 2h8v4h6v15H2V6h6Zm2 4h4V4h-4ZM2 11v2h20v-2Z" fill={color} />
      ) : section === 'skills' ? (
        <>
          <Circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
          <Path
            d="m7 12 3 3 7-7M12 0v4m0 16v4M0 12h4m16 0h4"
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        </>
      ) : (
        <>
          <Path d="M2 3h20v18H2Z" fill="none" stroke={color} strokeWidth={2} />
          <Circle cx="9" cy="9" r="3" fill={color} />
          <Path
            d="M5 18v-2a4 4 0 0 1 8 0v2Zm10-9h4m-4 5h4"
            fill={color}
            stroke={color}
          />
        </>
      )}
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
  appearance: TemplateProps['appearance']
  lead?: ReactNode
  children: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  const { heading } = usePdfTranslation()
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={25}>
        <View style={styles.sectionHeading}>
          <View style={styles.icon}>
            <SectionIcon
              section={section}
              color={appearance.colors?.headings ?? '#292929'}
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
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  const accent = appearance.colors?.accent ?? appearance.accent
  return (
    <View
      wrap={false}
      minPresenceAhead={22}
      style={[styles.rail, styles.entryHeader, { borderLeftColor: accent }]}
    >
      <View style={[styles.marker, { backgroundColor: accent }]} />
      {dates && (
        <Text colorRole="details" style={styles.dates}>
          {dates}
        </Text>
      )}
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
    </View>
  )
}

function EntryBody({
  text,
  appearance,
  bullets = false,
  children,
}: {
  text?: string
  appearance: TemplateProps['appearance']
  bullets?: boolean
  children?: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  const accent = appearance.colors?.accent ?? appearance.accent
  return (
    <View style={[styles.rail, styles.entryBody, { borderLeftColor: accent }]}>
      {children}
      {text
        ?.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => (
          <Text key={index} style={styles.body} orphans={2} widows={2}>
            {bullets && !/^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
              ? `\u2022 ${line}`
              : line}
          </Text>
        ))}
      <View style={[styles.endpoint, { backgroundColor: accent }]} />
    </View>
  )
}

export function SilhouetteDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, silhouetteTemplate.colorDefaults)
  const foreground = surfaceForeground(colors.surface)
  const sidebarColors = {
    headings: foreground,
    details: foreground,
    body: foreground,
    ...appearance.colors,
  }
  const sidebarAppearance = { ...appearance, colors: sidebarColors }
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const contacts = [
    cv.personal.phone,
    cv.personal.email,
    cv.personal.location,
    cv.personal.website,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
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
      entry.email,
      entry.phone,
    ].some((value) => value.trim()),
  )
  const educationHeader = (entry: (typeof education)[number]) => (
    <EntryHeader
      title={entry.school}
      organization={entry.degree}
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
        headingDefaults={silhouetteTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[styles.page, pageLanguageStyle(appearance.language)]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          {cv.personal.portrait && <View style={styles.portraitCutout} />}
          <View style={styles.columns}>
            <PdfLanguage language={appearance.language} colors={sidebarColors}>
              <View style={styles.sidebar}>
                {cv.personal.portrait && (
                  <Image src={cv.personal.portrait} style={styles.portrait} />
                )}
                {cv.summary.trim() && (
                  <Section
                    section="summary"
                    appearance={sidebarAppearance}
                    lead={
                      <Text style={styles.body}>
                        {cv.summary.split('\n')[0]}
                      </Text>
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
                {contacts.length > 0 && (
                  <Section
                    section="details"
                    appearance={sidebarAppearance}
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
                  <Section section="skills" appearance={sidebarAppearance}>
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
                  <Section section="languages" appearance={sidebarAppearance}>
                    {languages.map((value, index) => (
                      <Text
                        key={index}
                        style={styles.contact}
                      >{`\u2022 ${value}`}</Text>
                    ))}
                  </Section>
                )}
              </View>
            </PdfLanguage>
            <View style={styles.main}>
              <View
                wrap={false}
                style={[
                  styles.header,
                  {
                    minHeight: cv.personal.portrait ? 208 : 52,
                    paddingTop: cv.personal.portrait ? 30 : 0,
                  },
                ]}
                minPresenceAhead={50}
              >
                <Text colorRole="headings" style={styles.name}>
                  {cv.personal.fullName || t('Your name')}
                </Text>
                {cv.personal.jobTitle.trim() && (
                  <Text colorRole="details" style={styles.jobTitle}>
                    {cv.personal.jobTitle}
                  </Text>
                )}
              </View>
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
                        bullets
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
                  lead={referenceHeader(references[0]!)}
                >
                  {references.map((entry, index) => (
                    <View key={entry.id}>
                      {index > 0 && referenceHeader(entry)}
                      <EntryBody appearance={appearance}>
                        <ContactText
                          values={[entry.email, entry.phone]}
                          style={styles.body}
                        />
                      </EntryBody>
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
