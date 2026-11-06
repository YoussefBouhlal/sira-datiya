import { Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import { resolveSkillProficiencyDisplay, type TemplateProps } from '../types'
import { botanicalTemplate } from './index'
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
  children?: ReactNode
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

export function BotanicalDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, botanicalTemplate.colorDefaults)
  const accent = appearance.colors?.accent ?? appearance.accent
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const mode = resolveSkillProficiencyDisplay(
    botanicalTemplate,
    appearance.skillProficiencyDisplay,
  )
  const contact = [
    cv.personal.location,
    cv.personal.phone,
    cv.personal.email,
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
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={20}>
      {title && (
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
      [entry.role, entry.employer, entry.location].filter(Boolean).join(', '),
      dates(entry.startDate, entry.endDate, entry.current),
    )
  const educationHeader = (entry: (typeof education)[number]) =>
    entryHeader(
      [entry.degree, entry.school].filter(Boolean).join(', '),
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
      <ContactText
        values={[entry.email, entry.phone]}
        separator="\n"
        style={styles.contact}
      />
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
        colors={{ ...colors, ...appearance.colors }}
        headings={cv.headings}
        headingDefaults={botanicalTemplate.headings}
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
          <Svg fixed viewBox="0 0 600 86" style={styles.artwork}>
            <Path
              d="M0 0 C17 3 0 54 30 48 C64 30 69 67 89 69 C128 72 139 37 177 61 L205 86 L0 86 Z"
              fill="#b9b7e8"
            />
            <Path
              d="M70 86 C97 54 130 29 166 49 C199 68 213 69 244 86 Z M540 86 C565 63 530 45 556 34 C586 28 557 8 578 3 C598 1 595 25 600 28 L600 86 Z"
              fill="#efdde0"
            />
            <Path
              d="M229 86 C215 70 163 48 177 37 C194 23 241 64 260 67 C279 69 222 22 236 13 C258 0 284 58 298 67 C311 76 278 10 297 7 C326 3 324 66 335 70 C349 76 333 12 354 11 C381 10 367 68 366 86 Z"
              fill={accent}
              stroke={accent}
              strokeWidth={0.5}
            />
          </Svg>
          <View style={styles.header}>
            <View style={styles.identity}>
              <Text colorRole="headings" style={styles.name}>
                {cv.personal.fullName || t('Your name')}
              </Text>
              {cv.personal.jobTitle.trim() && (
                <Text
                  colorRole="details"
                  style={[styles.jobTitle, { color: colors.headings }]}
                >
                  {cv.personal.jobTitle}
                </Text>
              )}
              {cv.summary.trim() && (
                <Text style={styles.summary} orphans={2} widows={2}>
                  {cv.summary}
                </Text>
              )}
            </View>
            {cv.personal.portrait && (
              <View wrap={false} style={styles.portraitFrame}>
                <Image src={cv.personal.portrait} style={styles.portrait} />
                <Svg viewBox="0 0 186 186" style={styles.mask}>
                  <Path
                    fill={colors.surface}
                    fillRule="evenodd"
                    d="M0 0 H186 V186 H0 Z M25 0 C8 32 0 52 24 75 C56 105 29 129 49 158 C74 194 118 161 147 171 C164 176 178 186 186 174 V0 Z"
                  />
                </Svg>
              </View>
            )}
          </View>
          <View style={styles.columns}>
            <View style={styles.main}>
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
            </View>
            <View style={styles.sidebar}>
              {contact.length > 0 && (
                <Section
                  section="details"
                  appearance={appearance}
                  lead={
                    <ContactText
                      values={[contact[0]!]}
                      style={styles.contact}
                    />
                  }
                >
                  {contact.slice(1).map((value, index) => (
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
                  {skills.map((skill) => (
                    <View key={skill.id} wrap={false} style={styles.skill}>
                      <Text style={styles.contact}>{skill.name}</Text>
                      {skill.level !== null && (
                        <>
                          {mode !== 'bar' && (
                            <Text colorRole="details" style={styles.level}>
                              {t(proficiencyLevels[skill.level - 1]!)}
                            </Text>
                          )}
                          {mode !== 'text' && (
                            <View style={styles.segments}>
                              {proficiencyLevels.map((level, index) => (
                                <View
                                  key={level}
                                  style={[
                                    styles.segment,
                                    {
                                      backgroundColor: accent,
                                      opacity: index < skill.level! ? 1 : 0.18,
                                    },
                                  ]}
                                />
                              ))}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  ))}
                </Section>
              )}
              {languages.length > 0 && (
                <Section
                  section="languages"
                  appearance={appearance}
                  lead={<Text style={styles.contact}>{languages[0]}</Text>}
                >
                  {languages.slice(1).map((value, index) => (
                    <Text key={index} style={styles.contact}>
                      {value}
                    </Text>
                  ))}
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
