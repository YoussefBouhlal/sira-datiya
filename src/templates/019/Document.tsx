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
import { atelierTemplate } from './index'
import { createStyles } from './styles'

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
  const foreground = sidebar ? '#714b3e' : '#fff8ef'
  return (
    <View style={styles.section}>
      <View wrap={false} minPresenceAhead={20}>
        <View
          style={[
            styles.headingBand,
            ...(sidebar ? [styles.sidebarHeadingBand] : []),
          ]}
        >
          <Svg viewBox="0 0 20 20" style={styles.star}>
            <Path
              d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0 Z"
              fill={appearance.colors?.accent ?? foreground}
            />
          </Svg>
          <PdfLanguage
            language={appearance.language}
            colors={{ headings: appearance.colors?.headings ?? foreground }}
          >
            <Text section={section} colorRole="headings" style={styles.heading}>
              {heading(section)}
            </Text>
          </PdfLanguage>
        </View>
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

export function AtelierDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, atelierTemplate.colorDefaults)
  const bandColors = {
    headings: appearance.colors?.headings ?? '#fff8ef',
    details: appearance.colors?.details ?? '#f3e8da',
    body: appearance.colors?.body ?? '#fff8ef',
  }
  const paper =
    appearance.pageSize === 'LETTER'
      ? { width: 612, height: 792 }
      : { width: 595.28, height: 841.89 }
  const t = (key: string) => translate(appearance.language, key)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const contacts = [
    cv.personal.email,
    cv.personal.phone,
    cv.personal.location,
    cv.personal.website,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
  const skills = cv.skills.filter((entry) => entry.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const certifications = cv.certifications.filter((value) => value.trim())
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
  const references = cv.references.filter((entry) =>
    [
      entry.name,
      entry.jobTitle,
      entry.organization,
      entry.email,
      entry.phone,
    ].some((value) => value.trim()),
  )
  const entryHeader = (title: string, date?: string) => (
    <View style={styles.entryHeader} wrap={false}>
      {title.trim() && (
        <Text colorRole="headings" style={styles.entryTitle}>
          {title}
        </Text>
      )}
      {date && (
        <Text colorRole="details" style={styles.dates}>
          {date}
        </Text>
      )}
    </View>
  )
  const experienceHeader = (entry: (typeof experience)[number]) =>
    entryHeader(
      [entry.role, entry.employer, entry.location].filter(Boolean).join(' - '),
      dates(entry.startDate, entry.endDate, entry.current),
    )
  const educationHeader = (entry: (typeof education)[number]) =>
    entryHeader(
      [entry.degree, entry.school].filter(Boolean).join(' - '),
      dates(entry.startDate, entry.endDate),
    )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <View wrap={false}>
      {entryHeader(entry.name)}
      {entry.url.trim() && (
        <ContactText values={[entry.url]} style={styles.body} />
      )}
    </View>
  )
  const referenceEntry = (entry: (typeof references)[number]) => (
    <View wrap={false} style={styles.entry}>
      {entryHeader(
        [entry.name, entry.jobTitle, entry.organization]
          .filter(Boolean)
          .join(' - '),
      )}
      <ContactText values={[entry.email, entry.phone]} style={styles.body} />
    </View>
  )
  const skillEntry = (skill: (typeof skills)[number]) => (
    <View style={styles.skill}>
      <Text
        style={styles.body}
        minPresenceAhead={skill.level === null ? 0 : 16}
      >
        {skill.name}
      </Text>
      {skill.level !== null && (
        <Text colorRole="details" style={styles.level}>
          {t(proficiencyLevels[skill.level - 1]!)}
        </Text>
      )}
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
        colors={colors}
        headings={cv.headings}
        headingDefaults={atelierTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { color: colors.body, fontSize: appearance.fontSize - 1 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <View fixed style={styles.sidebarBackground} />
          <Svg
            fixed
            viewBox="0 0 600 842"
            preserveAspectRatio="none"
            style={[styles.artwork, paper]}
          >
            <Path
              d="M245 246 H346 M245 275 H310 M260 232 V320 M286 240 V298 M512 760 V830 M540 744 V842 M565 778 V842 M492 798 H600 M520 823 H600"
              stroke={colors.accent}
              strokeWidth={0.65}
              opacity={0.28}
            />
            <Path
              d="M540 286 Q542 294 550 296 Q542 298 540 306 Q538 298 530 296 Q538 294 540 286 Z M560 676 Q562 684 570 686 Q562 688 560 696 Q558 688 550 686 Q558 684 560 676 Z"
              fill={colors.accent}
              opacity={0.5}
            />
            <Path
              d="M262 794 H550"
              stroke="#714b3e"
              strokeWidth={5}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {cv.personal.portrait && (
                <View style={styles.portraitFrame} wrap={false}>
                  <Image src={cv.personal.portrait} style={styles.portrait} />
                  <Svg
                    viewBox="0 0 144 226"
                    preserveAspectRatio="none"
                    style={styles.mask}
                  >
                    <Path
                      fill="#85685b"
                      fillRule="evenodd"
                      d="M0 0 H144 V226 H0 Z M72 3 C33 3 3 33 3 72 V154 C3 192 33 223 72 223 C111 223 141 192 141 154 V72 C141 33 111 3 72 3 Z"
                    />
                    <Path
                      fill="none"
                      stroke="#d7c6b7"
                      strokeWidth={0.7}
                      d="M72 4 C34 4 4 34 4 72 V154 C4 192 34 222 72 222 C110 222 140 192 140 154 V72 C140 34 110 4 72 4 Z"
                    />
                  </Svg>
                </View>
              )}
              <PdfLanguage language={appearance.language} colors={bandColors}>
                {contacts.map((value, index) => (
                  <View key={index} style={styles.contact}>
                    <ContactText
                      values={[value]}
                      centered
                      style={styles.contactText}
                    />
                  </View>
                ))}
                {skills.length > 0 && (
                  <Section
                    section="skills"
                    sidebar
                    appearance={appearance}
                    lead={skillEntry(skills[0]!)}
                  >
                    {skills.slice(1).map((skill) => (
                      <View key={skill.id}>{skillEntry(skill)}</View>
                    ))}
                  </Section>
                )}
                {languages.length > 0 && (
                  <Section
                    section="languages"
                    sidebar
                    appearance={appearance}
                    lead={<Text style={styles.body}>{languages[0]}</Text>}
                  >
                    {languages.slice(1).map((value, index) => (
                      <Text key={index} style={styles.body}>
                        {value}
                      </Text>
                    ))}
                  </Section>
                )}
              </PdfLanguage>
            </View>
            <View style={styles.main}>
              <PdfLanguage language={appearance.language} colors={bandColors}>
                <View style={styles.header}>
                  <View wrap={false}>
                    {cv.personal.jobTitle.trim() && (
                      <Text colorRole="details" style={styles.jobTitle}>
                        {cv.personal.jobTitle}
                      </Text>
                    )}
                    <Text colorRole="headings" style={styles.name}>
                      {cv.personal.fullName || t('Your name')}
                    </Text>
                  </View>
                  {cv.summary.trim() && (
                    <Text style={styles.summary} orphans={2} widows={2}>
                      {cv.summary}
                    </Text>
                  )}
                </View>
              </PdfLanguage>
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
                        bullets
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
                <Section
                  section="certifications"
                  appearance={appearance}
                  lead={
                    <Description
                      text={certifications[0]!}
                      appearance={appearance}
                    />
                  }
                >
                  <Description
                    text={certifications.slice(1).join('\n')}
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
