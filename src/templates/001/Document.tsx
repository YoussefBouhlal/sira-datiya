import { Document, Page } from '@react-pdf/renderer'
import { PdfLanguage, View, ContactText } from '../shared/PdfLayout'
import { pageLanguageStyle, usePdfTranslation } from '../shared/localization'
import { dateRange as localizedDateRange, translate } from '../../i18n/messages'
import type { ReactNode } from 'react'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { Text } from '../shared/Text'
import type { TemplateProps } from '../types'
import { PageNumber, Portrait } from '../shared/content'
import { styles } from './styles'

function Description({ text }: { text: string }) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <Text key={index} style={styles.bullet} orphans={2} widows={2}>
        {/^([\u2022\u25cf\u25aa*-]|\d+[.)])\s/.test(line)
          ? line
          : `\u2022 ${line}`}
      </Text>
    ))
}

function Section({
  title,
  accent,
  children,
  inline = false,
}: {
  title: string
  accent: string
  children: ReactNode
  inline?: boolean
}) {
  const { t } = usePdfTranslation()
  return (
    <View
      style={[
        styles.section,
        { borderTopColor: accent },
        ...(inline ? [styles.row] : []),
      ]}
    >
      <Text
        colorRole="headings"
        style={[styles.heading, ...(inline ? [styles.rail] : [])]}
        minPresenceAhead={40}
      >
        {t(title)}
      </Text>
      {inline ? <View style={styles.content}>{children}</View> : children}
    </View>
  )
}

export function ClassicDocument({ cv, appearance }: TemplateProps) {
  const t = (text: string) => translate(appearance.language, text)
  const dateRange = (start: string, end: string, current = false) =>
    localizedDateRange(start, end, current, appearance.language)
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
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const languages = cv.languages.filter((value) => value.trim())
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
  const contact = [
    cv.personal.location,
    cv.personal.phone,
    cv.personal.email,
  ].filter(Boolean)
  const links = [cv.personal.website, cv.personal.linkedin].filter(Boolean)

  return (
    <Document
      title={`${cv.personal.fullName || 'Untitled'} - CV`}
      author={cv.personal.fullName}
      creator="Sira Datiya CV"
      language={appearance.language}
    >
      <PdfLanguage language={appearance.language} colors={appearance.colors}>
        <Page
          size={appearance.pageSize}
          style={[
            styles.page,
            { fontSize: appearance.fontSize },
            pageLanguageStyle(appearance.language),
          ]}
        >
          <View style={styles.header}>
            <Portrait cv={cv} />
            <Text
              colorRole="headings"
              style={[styles.name, { fontSize: appearance.fontSize * 1.4 }]}
            >
              {cv.personal.fullName || t('Your name')}
              {cv.personal.jobTitle && (
                <Text
                  colorRole="details"
                  style={{ color: '#171717' }}
                >{`, ${cv.personal.jobTitle}`}</Text>
              )}
            </Text>
            {contact.length > 0 && (
              <ContactText
                style={styles.contact}
                values={contact}
                separator=", "
                centered
              />
            )}
            {links.length > 0 && (
              <ContactText
                style={styles.contact}
                values={links}
                separator=", "
                centered
              />
            )}
          </View>
          {cv.summary.trim() && (
            <Section
              title="Profile"
              accent={appearance.colors?.accent ?? appearance.accent}
              inline
            >
              <Text style={styles.body} orphans={2} widows={2}>
                {cv.summary}
              </Text>
            </Section>
          )}
          {experience.length > 0 && (
            <Section
              title="Experience"
              accent={appearance.colors?.accent ?? appearance.accent}
            >
              {experience.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  <Text
                    colorRole="details"
                    style={[
                      styles.dates,
                      { fontSize: appearance.fontSize * 0.8 },
                    ]}
                    minPresenceAhead={35}
                  >
                    {dateRange(entry.startDate, entry.endDate, entry.current)}
                  </Text>
                  <View style={styles.content}>
                    <View style={styles.entryHeader} minPresenceAhead={30}>
                      <Text
                        colorRole="headings"
                        style={[
                          styles.entryTitle,
                          { fontSize: appearance.fontSize * 1.2 },
                        ]}
                      >
                        {entry.role || entry.employer}
                        {entry.role && entry.employer && (
                          <Text
                            colorRole="details"
                            style={{ color: '#171717' }}
                          >{` \u2014 ${entry.employer}`}</Text>
                        )}
                      </Text>
                      {entry.location && (
                        <Text
                          colorRole="details"
                          style={[
                            styles.location,
                            { fontSize: appearance.fontSize * 0.8 },
                          ]}
                        >
                          {entry.location}
                        </Text>
                      )}
                    </View>
                    <Description text={entry.description} />
                  </View>
                </View>
              ))}
            </Section>
          )}
          {education.length > 0 && (
            <Section
              title="Education"
              accent={appearance.colors?.accent ?? appearance.accent}
            >
              {education.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  <Text
                    colorRole="details"
                    style={[
                      styles.dates,
                      { fontSize: appearance.fontSize * 0.8 },
                    ]}
                    minPresenceAhead={35}
                  >
                    {dateRange(entry.startDate, entry.endDate)}
                  </Text>
                  <View style={styles.content}>
                    <View style={styles.entryHeader} minPresenceAhead={30}>
                      <Text
                        colorRole="headings"
                        style={[
                          styles.entryTitle,
                          { fontSize: appearance.fontSize * 1.2 },
                        ]}
                      >
                        {entry.degree || entry.school}
                      </Text>
                      {entry.degree && entry.school && (
                        <Text
                          colorRole="details"
                          style={[
                            styles.location,
                            { fontSize: appearance.fontSize * 0.8 },
                          ]}
                        >
                          {entry.school}
                        </Text>
                      )}
                    </View>
                    <Description text={entry.description} />
                  </View>
                </View>
              ))}
            </Section>
          )}
          {skills.length > 0 && (
            <Section
              title="Skills"
              accent={appearance.colors?.accent ?? appearance.accent}
            >
              <Text style={styles.body} orphans={2} widows={2}>
                {skills.map((skill, index) => (
                  <Text key={skill.id}>
                    {index > 0 ? ' / ' : ''}
                    {skill.name}
                    {skill.level !== null && (
                      <Text colorRole="details">{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
                    )}
                  </Text>
                ))}
              </Text>
            </Section>
          )}
          {languages.length > 0 && (
            <Section
              title="Languages"
              accent={appearance.colors?.accent ?? appearance.accent}
              inline
            >
              <View style={styles.languages}>
                {languages.map((language, index) => (
                  <Text
                    key={index}
                    style={styles.language}
                    orphans={2}
                    widows={2}
                  >
                    {language}
                  </Text>
                ))}
              </View>
            </Section>
          )}
          {projects.length > 0 && (
            <Section
              title="Projects"
              accent={appearance.colors?.accent ?? appearance.accent}
            >
              {projects.map((entry) => (
                <View key={entry.id} style={styles.additionalEntry}>
                  {entry.name && (
                    <Text
                      colorRole="headings"
                      style={styles.additionalTitle}
                      minPresenceAhead={30}
                    >
                      {entry.name}
                    </Text>
                  )}
                  {entry.url && (
                    <Text colorRole="details" style={styles.body}>
                      {entry.url}
                    </Text>
                  )}
                  <Description text={entry.description} />
                </View>
              ))}
            </Section>
          )}
          {certifications.length > 0 && (
            <Section
              title="Certifications"
              accent={appearance.colors?.accent ?? appearance.accent}
            >
              <Description text={certifications.join('\n')} />
            </Section>
          )}
          {references.length > 0 && (
            <Section
              title="References"
              accent={appearance.colors?.accent ?? appearance.accent}
            >
              {references.map((entry) => (
                <View key={entry.id} style={styles.additionalEntry}>
                  <Text
                    colorRole="headings"
                    style={styles.additionalTitle}
                    minPresenceAhead={25}
                  >
                    {[entry.name, entry.jobTitle, entry.organization]
                      .filter(Boolean)
                      .join(' - ')}
                  </Text>
                  <Text colorRole="details" style={styles.body}>
                    {[entry.email, entry.phone].filter(Boolean).join(' | ')}
                  </Text>
                </View>
              ))}
            </Section>
          )}
          <PageNumber />
        </Page>
      </PdfLanguage>
    </Document>
  )
}
