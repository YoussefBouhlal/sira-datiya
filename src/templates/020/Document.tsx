import { Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { ribbonTemplate } from './index'
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

export function RibbonDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const accent = appearance.colors?.accent ?? appearance.accent
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const contacts = [
    cv.personal.phone,
    cv.personal.email,
    cv.personal.linkedin,
  ].filter((value) => value.trim())
  const skills = cv.skills.filter((skill) => skill.name.trim())
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
  const entryHeader = (title: string, secondary?: string, range?: string) => (
    <View wrap={false} style={styles.entryHeader} minPresenceAhead={22}>
      <View style={[styles.marker, { backgroundColor: accent }]} />
      <View style={styles.entryIdentity}>
        {title.trim() && (
          <Text colorRole="headings" style={styles.entryTitle}>
            {title}
          </Text>
        )}
        {secondary?.trim() && (
          <Text colorRole="details" style={styles.secondary}>
            {secondary}
          </Text>
        )}
      </View>
      {range && (
        <View style={[styles.dates, { borderLeftColor: accent }]}>
          <Text colorRole="details" style={styles.dateText}>
            {range}
          </Text>
        </View>
      )}
    </View>
  )
  const workHeader = (entry: (typeof experience)[number]) =>
    entryHeader(
      entry.role,
      [entry.employer, entry.location].filter(Boolean).join(', '),
      dates(entry.startDate, entry.endDate, entry.current),
    )
  const educationHeader = (entry: (typeof education)[number]) => (
    <View wrap={false} minPresenceAhead={22}>
      {entry.degree.trim() && (
        <Text colorRole="headings" style={styles.entryTitle}>
          {entry.degree}
        </Text>
      )}
      {entry.school.trim() && (
        <Text colorRole="details" style={styles.secondary}>
          {entry.school}
        </Text>
      )}
      {(entry.startDate || entry.endDate) && (
        <Text
          colorRole="details"
          style={[styles.dateText, styles.educationDates]}
        >
          {dates(entry.startDate, entry.endDate)}
        </Text>
      )}
    </View>
  )
  const projectHeader = (entry: (typeof projects)[number]) => (
    <View wrap={false} minPresenceAhead={22}>
      {entryHeader(entry.name)}
      {entry.url.trim() && (
        <ContactText values={[entry.url]} style={styles.body} />
      )}
    </View>
  )
  const referenceEntry = (entry: (typeof references)[number]) => (
    <View wrap={false} style={styles.entry}>
      <Text colorRole="headings" style={styles.entryTitle}>
        {entry.name}
      </Text>
      <Text colorRole="details" style={styles.body}>
        {[entry.jobTitle, entry.organization].filter(Boolean).join(', ')}
      </Text>
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
        headingDefaults={ribbonTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize - 2 },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View wrap={false} style={styles.header} minPresenceAhead={90}>
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
            {contacts.length > 0 && (
              <View style={[styles.contacts, { borderLeftColor: accent }]}>
                {contacts.map((value) => (
                  <ContactText
                    key={value}
                    values={[value]}
                    style={styles.contact}
                  />
                ))}
              </View>
            )}
          </View>
          {cv.personal.website.trim() && (
            <View wrap={false} style={styles.ribbon} minPresenceAhead={70}>
              <View style={[styles.website, { backgroundColor: accent }]}>
                <ContactText
                  values={[cv.personal.website]}
                  style={styles.websiteText}
                />
              </View>
              <View style={styles.quote}>
                <Svg width={13} height={12} viewBox="0 0 20 16">
                  <Path
                    d="M1 1h7v7l-3 7H2l3-7H1z M12 1h7v7l-3 7h-3l3-7h-4z"
                    fill="#ffffff"
                  />
                </Svg>
              </View>
            </View>
          )}
          <View style={styles.columns}>
            <View style={styles.sidebar}>
              {cv.personal.location.trim() && (
                <View style={styles.location}>
                  <View wrap={false} style={styles.pin} minPresenceAhead={18}>
                    <Svg width={11} height={14} viewBox="0 0 16 20">
                      <Path
                        d="M8 0a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z M8 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
                        fill={accent}
                        fillRule="evenodd"
                      />
                    </Svg>
                  </View>
                  <ContactText
                    values={[cv.personal.location]}
                    style={styles.sidebarBody}
                  />
                </View>
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
              {skills.length > 0 && (
                <View style={[styles.skillSection, { borderTopColor: accent }]}>
                  <Section section="skills" appearance={appearance}>
                    {skills.map((skill) => (
                      <View key={skill.id} style={styles.skill}>
                        <Text
                          style={styles.sidebarBody}
                          minPresenceAhead={skill.level === null ? 0 : 15}
                        >
                          {skill.name}
                        </Text>
                        {skill.level !== null && (
                          <Text colorRole="details" style={styles.level}>
                            {t(proficiencyLevels[skill.level - 1]!)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </Section>
                </View>
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
            <View style={styles.main}>
              {cv.summary.trim() && (
                <Section section="summary" appearance={appearance}>
                  <View style={[styles.profile, { borderLeftColor: accent }]}>
                    <Text style={styles.body} orphans={2} widows={2}>
                      {cv.summary}
                    </Text>
                  </View>
                </Section>
              )}
              {experience.length > 0 && (
                <Section
                  section="experience"
                  appearance={appearance}
                  lead={workHeader(experience[0]!)}
                >
                  {experience.map((entry, index) => (
                    <View key={entry.id} style={styles.entry}>
                      {index > 0 && workHeader(entry)}
                      <Description
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
            render={({ pageNumber }) =>
              t('Page {page}').replace('{page}', String(pageNumber))
            }
          />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
