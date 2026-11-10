import { Document, Font, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { effectiveColors } from '../../domain/cv/colors'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import { resolveSkillProficiencyDisplay, type TemplateProps } from '../types'
import headingFont from './assets/Oswald-Regular.ttf?url'
import { floraTemplate } from './index'
import { createStyles } from './styles'

const nodeFontDirectory = './assets/'
Font.register({
  family: 'FloraHeading',
  src:
    typeof window === 'undefined'
      ? `${decodeURIComponent(new URL(nodeFontDirectory, import.meta.url).pathname)}Oswald-Regular.ttf`
      : headingFont,
})

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
        <View style={styles.headingRow}>
          <Text section={section} colorRole="headings" style={styles.heading}>
            {heading(section)}
          </Text>
          <View
            style={[
              styles.rule,
              {
                borderBottomColor:
                  appearance.colors?.accent ?? appearance.accent,
              },
            ]}
          />
        </View>
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

export function FloraDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const colors = effectiveColors(appearance, floraTemplate.colorDefaults)
  const paper =
    appearance.pageSize === 'LETTER'
      ? { width: 612, height: 792 }
      : { width: 595.28, height: 841.89 }
  const identityColors = {
    ...colors,
    headings: appearance.colors?.headings ?? '#403c35',
  }
  const accent = colors.accent
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
  const mode = resolveSkillProficiencyDisplay(
    floraTemplate,
    appearance.skillProficiencyDisplay,
  )
  const contact = [
    cv.personal.phone,
    cv.personal.location,
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
        <PdfLanguage language={appearance.language} colors={identityColors}>
          <Text colorRole="headings" style={styles.entryTitle}>
            {title}
          </Text>
        </PdfLanguage>
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
      <PdfLanguage language={appearance.language} colors={identityColors}>
        <Text colorRole="headings" style={styles.entryTitle}>
          {[entry.name, entry.jobTitle, entry.organization]
            .filter(Boolean)
            .join(' - ')}
        </Text>
      </PdfLanguage>
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
        colors={{ ...colors, ...appearance.colors }}
        headings={cv.headings}
        headingDefaults={floraTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { color: colors.body, fontSize: appearance.fontSize - 2 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View
            fixed
            style={[styles.background, { backgroundColor: colors.surface }]}
          />
          <Svg
            fixed
            viewBox="0 0 600 842"
            preserveAspectRatio="none"
            style={[styles.artwork, paper]}
          >
            <Path
              d="M0 0 H405 C345 35 235 30 120 86 C60 100 29 142 0 170 Z"
              fill="#e4d6ab"
              opacity={0.55}
            />
            <Path
              d="M0 0 H125 C99 93 66 184 0 280 Z M600 286 C558 347 551 447 600 490 Z M0 842 V696 C75 689 108 733 128 842 Z"
              fill="#d7bda0"
              opacity={0.46}
            />
            <Path
              d="M0 119 C97 89 98 168 30 213 L0 252 Z M30 651 C-6 615 47 587 90 529 C96 579 50 599 57 628 C59 642 45 650 30 651 Z M92 842 C133 795 180 797 225 842 Z"
              fill="#edbb9e"
              opacity={0.65}
            />
            <Path
              d="M470 0 C472 23 484 30 480 49 C492 29 513 17 510 0 Z M499 54 C480 61 492 79 483 94 C513 84 524 70 499 54 Z M118 656 C150 675 147 698 133 720 C120 740 132 754 132 768 C96 739 92 716 108 693 C122 675 121 666 118 656 Z"
              fill="#a0a474"
              opacity={0.7}
            />
            <Path
              d="M600 554 C564 605 531 621 503 638 C476 654 515 661 541 657 C487 674 475 691 520 696 C471 715 477 730 523 733 C479 754 484 767 530 766 C486 790 492 810 535 802 L502 842 H600 Z"
              fill="#a0a474"
              opacity={0.58}
            />
            <Path
              d="M600 712 C559 738 561 781 579 805 L563 842 H600 Z M0 842 V785 C41 779 66 811 76 842 Z"
              fill={accent}
              opacity={0.12}
            />
          </Svg>
          <View style={styles.header}>
            {cv.personal.portrait && (
              <View wrap={false} style={styles.portraitFrame}>
                <Image src={cv.personal.portrait} style={styles.portrait} />
                <Svg viewBox="0 0 68 76" style={styles.mask}>
                  <Path
                    fill={colors.surface}
                    fillRule="evenodd"
                    d="M0 0 H68 V76 H0 Z M68 0 C43 12 12 -4 5 27 C-3 46 9 59 0 76 C21 62 43 73 60 51 C74 34 60 18 68 0 Z"
                  />
                </Svg>
              </View>
            )}
            <PdfLanguage language={appearance.language} colors={identityColors}>
              <Text colorRole="headings" style={styles.name}>
                {cv.personal.fullName || t('Your name')}
              </Text>
            </PdfLanguage>
            {cv.personal.jobTitle.trim() && (
              <Text colorRole="details" style={styles.jobTitle}>
                {cv.personal.jobTitle}
              </Text>
            )}
            {contact.length > 0 && (
              <ContactText
                values={contact}
                separator={'  \u00b7  '}
                centered
                style={styles.contact}
              />
            )}
          </View>
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {skills.length > 0 && (
                <Section section="skills" appearance={appearance}>
                  {skills.map((skill) => (
                    <View key={skill.id} style={styles.skill}>
                      <Text
                        style={styles.sidebarBody}
                        minPresenceAhead={skill.level === null ? 0 : 18}
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
                              <View style={styles.track} />
                              <View
                                style={[
                                  styles.fill,
                                  {
                                    width: `${skill.level * 20}%`,
                                    backgroundColor: accent,
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
                <Section
                  section="languages"
                  appearance={appearance}
                  lead={<Text style={styles.sidebarBody}>{languages[0]}</Text>}
                >
                  {languages.slice(1).map((value, index) => (
                    <Text key={index} style={styles.sidebarBody}>
                      {value}
                    </Text>
                  ))}
                </Section>
              )}
            </View>
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
