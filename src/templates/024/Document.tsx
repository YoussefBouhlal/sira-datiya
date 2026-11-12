import { Circle, Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { crestTemplate } from './index'
import { createStyles } from './styles'

function SectionIcon({
  section,
  color,
}: {
  section: SectionHeadingKey
  color: string
}) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      {section === 'summary' ? (
        <>
          <Circle cx="12" cy="6" r="5" fill={color} />
          <Path d="M2 23v-3a10 9 0 0 1 20 0v3Z" fill={color} />
        </>
      ) : section === 'education' || section === 'experience' ? (
        <>
          <Path d="m1 7 11-6 11 6-11 6ZM5 12v6l7 4 7-4v-6l-7 4Z" fill={color} />
          <Path d="M2 8v10" stroke={color} strokeWidth={1.5} />
        </>
      ) : section === 'languages' ? (
        <>
          <Path d="M1 2h22v16H9l-5 5v-5H1Z" fill={color} />
          <Path
            d="m5 14 3-8 3 8M6 11h4M15 6h5m-2-2v3m-3 1 5 6m0-6-5 6"
            stroke="#ffffff"
            strokeWidth={1.2}
          />
        </>
      ) : section === 'skills' ? (
        <>
          <Path
            d="m12 1 3 4 5-1-1 5 4 3-4 3 1 5-5-1-3 4-3-4-5 1 1-5-4-3 4-3-1-5 5 1Z"
            fill="none"
            stroke={color}
            strokeWidth={1.2}
          />
          <Circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        </>
      ) : (
        <>
          <Path d="M3 1h18v22H3Z" fill={color} />
          <Circle cx="12" cy="8" r="3" fill="#ffffff" />
          <Path
            d="M7 19v-2a5 5 0 0 1 10 0v2Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1}
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

export function CrestDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, crestTemplate.colorDefaults)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const width = appearance.pageSize === 'LETTER' ? 612 : 595.28
  const height = appearance.pageSize === 'LETTER' ? 792 : 841.89
  const artworkTransform =
    appearance.language === 'ar'
      ? `translate(${width}, 0) scale(-1, 1)`
      : undefined
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
        headingDefaults={crestTemplate.headings}
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
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Path d={`M0 0H${width}V46H0Z`} fill="#384650" />
            <Path d={`M0 46H${width}V61H0Z`} fill={colors.accent} />
            <Path
              d="M0 0H250L310 68H0Z"
              fill="#263037"
              stroke="#ffffff"
              strokeWidth={4}
              transform={artworkTransform}
            />
            <Path
              d={`M0 ${height - 29}H${width}V${height}H0Z`}
              fill={colors.accent}
            />
            <Path
              d={`M0 ${height - 29}H280L289 ${height}H0Z`}
              fill="#263037"
              transform={artworkTransform}
            />
          </Svg>
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {cv.personal.portrait ? (
                <Image src={cv.personal.portrait} style={styles.portrait} />
              ) : (
                <View style={{ height: 12 }} />
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
              {contacts.length > 0 && (
                <Section
                  section="details"
                  appearance={appearance}
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
              <View
                wrap={false}
                style={[
                  styles.header,
                  { minHeight: cv.personal.portrait ? 162 : 52 },
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
