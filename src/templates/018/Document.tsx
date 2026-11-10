import { Document, Page, Path, Svg } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { SectionHeadingKey } from '../../domain/cv/types'
import { dateRange, translate } from '../../i18n/messages'
import { ContactText, Image, PdfLanguage, View } from '../shared/PdfLayout'
import { PageNumber } from '../shared/content'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { confettiTemplate } from './index'
import { createStyles } from './styles'

type Entry = {
  id: string
  title: string
  dates?: string
  location?: string
  contact?: readonly string[]
  description: string
}

function Section({
  section,
  number,
  appearance,
  lead,
  children,
}: {
  section: SectionHeadingKey
  number: number
  appearance: TemplateProps['appearance']
  lead?: ReactNode
  children: ReactNode
}) {
  const styles = createStyles(appearance.fontSize)
  const { heading } = usePdfTranslation()
  const title = (
    <View style={styles.headingRow}>
      <Text colorRole="headings" style={styles.number}>
        {String(number).padStart(2, '0')}
      </Text>
      <Text section={section} colorRole="headings" style={styles.heading}>
        {heading(section)}
      </Text>
    </View>
  )
  return (
    <>
      {section === 'summary' ? (
        <View style={styles.row}>
          <View style={styles.rail}>{title}</View>
          <View style={styles.content}>{children}</View>
        </View>
      ) : (
        <>
          <View wrap={false} minPresenceAhead={22}>
            {title}
            {lead}
          </View>
          {children}
        </>
      )}
      <View style={styles.sectionEnd} />
    </>
  )
}

function EntryHeader({
  entry,
  appearance,
}: {
  entry: Entry
  appearance: TemplateProps['appearance']
}) {
  const styles = createStyles(appearance.fontSize)
  return (
    <View style={styles.entryHeader} wrap={false}>
      <View style={styles.rail}>
        {entry.dates && (
          <Text colorRole="details" style={styles.dates}>
            {entry.dates}
          </Text>
        )}
        {entry.location && (
          <Text colorRole="details" style={styles.location}>
            {entry.location}
          </Text>
        )}
      </View>
      <View style={styles.content}>
        {entry.title && (
          <Text colorRole="headings" style={styles.entryTitle}>
            {entry.title}
          </Text>
        )}
        {entry.contact && (
          <ContactText values={entry.contact} style={styles.body} />
        )}
      </View>
    </View>
  )
}

function Artwork({ appearance }: Pick<TemplateProps, 'appearance'>) {
  const styles = createStyles(appearance.fontSize)
  const paper =
    appearance.pageSize === 'LETTER'
      ? { width: 612, height: 792 }
      : { width: 595.28, height: 841.89 }
  const shapes = [
    'M0 0 H7 V7 H0 Z',
    'M4 0 A4 4 0 1 0 4 8 A4 4 0 1 0 4 0',
    'M0 0 L6 4 L0 8 Z',
    'M0 0 L8 8',
    'M0 8 V4 H4 V0 H8',
    'M0 8 Q0 0 8 0',
  ]
  const colors = [
    appearance.colors?.accent ?? appearance.accent,
    '#659ca9',
    '#b37566',
    '#8a9d92',
    '#d6c778',
  ]
  return (
    <Svg fixed viewBox="0 0 600 842" style={[styles.artwork, paper]}>
      {Array.from({ length: 78 }, (_, index) => {
        const left = 8 + ((index * 137 + 19) % 578)
        const top = 42 + ((index * 97 + 23) % 750)
        return (
          <Path
            key={index}
            d={shapes[index % shapes.length]!}
            transform={`translate(${left}, ${top})`}
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth={1.1}
            opacity={0.17}
          />
        )
      })}
    </Svg>
  )
}

export function ConfettiDocument({ cv, appearance }: TemplateProps) {
  const styles = createStyles(appearance.fontSize)
  const t = (value: string) => translate(appearance.language, value)
  const dates = (start: string, end: string, current = false) =>
    dateRange(start, end, current, appearance.language)
  const experience: Entry[] = cv.experience
    .filter(
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
    .map((entry) => ({
      id: entry.id,
      title: [entry.role, entry.employer].filter(Boolean).join(' - '),
      dates: dates(entry.startDate, entry.endDate, entry.current),
      location: entry.location,
      description: entry.description,
    }))
  const education: Entry[] = cv.education
    .filter((entry) =>
      [
        entry.degree,
        entry.school,
        entry.startDate,
        entry.endDate,
        entry.description,
      ].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: [entry.degree, entry.school].filter(Boolean).join(' - '),
      dates: dates(entry.startDate, entry.endDate),
      description: entry.description,
    }))
  const skills = cv.skills.filter((entry) => entry.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
  const certifications = cv.certifications.filter((value) => value.trim())
  const projects: Entry[] = cv.projects
    .filter((entry) =>
      [entry.name, entry.url, entry.description].some((value) => value.trim()),
    )
    .map((entry) => ({
      ...entry,
      title: entry.name,
      contact: entry.url ? [entry.url] : undefined,
    }))
  const references: Entry[] = cv.references
    .filter((entry) =>
      [
        entry.name,
        entry.jobTitle,
        entry.organization,
        entry.email,
        entry.phone,
      ].some((value) => value.trim()),
    )
    .map((entry) => ({
      id: entry.id,
      title: [entry.name, entry.jobTitle, entry.organization]
        .filter(Boolean)
        .join(' - '),
      contact: [entry.email, entry.phone].filter(Boolean),
      description: '',
    }))
  const sections: [SectionHeadingKey, boolean][] = [
    ['summary', !!cv.summary.trim()],
    ['experience', experience.length > 0],
    ['education', education.length > 0],
    ['skills', skills.length > 0],
    ['projects', projects.length > 0],
    ['languages', languages.length > 0],
    ['certifications', certifications.length > 0],
    ['references', references.length > 0],
  ]
  const visible = sections
    .filter(([, populated]) => populated)
    .map(([key]) => key)
  const section = (
    key: SectionHeadingKey,
    children: ReactNode,
    lead?: ReactNode,
  ) => (
    <Section
      section={key}
      number={visible.indexOf(key) + 1}
      appearance={appearance}
      lead={lead}
    >
      {children}
    </Section>
  )
  const entries = (key: SectionHeadingKey, items: Entry[]) =>
    items.length > 0 &&
    section(
      key,
      items.map((entry, index) => (
        <View key={entry.id}>
          {index > 0 && (
            <View wrap={false} minPresenceAhead={entry.description ? 22 : 0}>
              <EntryHeader entry={entry} appearance={appearance} />
            </View>
          )}
          {entry.description.trim() && (
            <View style={styles.row}>
              <View style={styles.rail} />
              <View style={styles.content}>
                {entry.description
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, lineIndex) => (
                    <Text
                      key={lineIndex}
                      style={styles.description}
                      orphans={2}
                      widows={2}
                    >
                      {/^(?:[-*\u2022\u25cf\u25aa]|\d+[.)])\s/.test(line)
                        ? line
                        : `\u2022 ${line}`}
                    </Text>
                  ))}
              </View>
            </View>
          )}
          <View style={styles.entryEnd} />
        </View>
      )),
      <EntryHeader entry={items[0]!} appearance={appearance} />,
    )
  const list = (key: SectionHeadingKey, values: ReactNode[]) =>
    values.length > 0 &&
    section(
      key,
      <View style={styles.row}>
        <View style={styles.rail} />
        <View style={styles.content}>{values}</View>
      </View>,
    )
  const contacts = [
    ['Location', cv.personal.location],
    ['Phone number', cv.personal.phone],
    ['Email address', cv.personal.email],
    ['Website or portfolio', cv.personal.website],
    ['LinkedIn', cv.personal.linkedin],
  ].filter(([, value]) => value?.trim())
  return (
    <Document
      title={`${cv.personal.fullName || 'Untitled'} - CV`}
      author={cv.personal.fullName}
      creator="Sira Datiya CV"
      language={appearance.language}
    >
      <PdfLanguage
        language={appearance.language}
        colors={{ ...confettiTemplate.colorDefaults, ...appearance.colors }}
        headings={cv.headings}
        headingDefaults={confettiTemplate.headings}
      >
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <Artwork appearance={appearance} />
          <View style={styles.header} wrap={false} minPresenceAhead={50}>
            {cv.personal.portrait && (
              <View style={styles.portraitFrame}>
                <Image src={cv.personal.portrait} style={styles.portrait} />
                <Svg viewBox="0 0 58 64" style={styles.mask}>
                  <Path
                    fill="#ffffff"
                    d="M0 0 H29 L0 16 Z M29 0 H58 V16 Z M0 48 L29 64 H0 Z M58 48 V64 H29 Z"
                  />
                </Svg>
              </View>
            )}
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
            <View style={styles.contacts}>
              {contacts.map(([label, value]) => (
                <View key={label} style={styles.contact} wrap={false}>
                  <Text colorRole="headings" style={styles.contactLabel}>
                    {t(label!)}
                  </Text>
                  <View style={styles.contactValue}>
                    <ContactText values={[value!]} style={styles.contactText} />
                  </View>
                </View>
              ))}
            </View>
          )}
          {cv.summary.trim() &&
            section(
              'summary',
              <Text style={styles.body} orphans={2} widows={2}>
                {cv.summary}
              </Text>,
            )}
          {entries('experience', experience)}
          {entries('education', education)}
          {list(
            'skills',
            skills.map((skill) => (
              <Text key={skill.id} style={styles.body} orphans={2} widows={2}>
                {skill.name}
                {skill.level !== null && (
                  <Text colorRole="details">{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
                )}
              </Text>
            )),
          )}
          {entries('projects', projects)}
          {list(
            'languages',
            languages.map((value, index) => (
              <Text key={index} style={styles.body} orphans={2} widows={2}>
                {value}
              </Text>
            )),
          )}
          {list(
            'certifications',
            certifications.map((value, index) => (
              <Text key={index} style={styles.body} orphans={2} widows={2}>
                {value}
              </Text>
            )),
          )}
          {entries('references', references)}
          <PageNumber />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
