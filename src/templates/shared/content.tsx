import { StyleSheet } from '@react-pdf/renderer'
import { Image, View, ContactText } from './PdfLayout'
import { usePdfTranslation } from './localization'
import { Text } from './Text'
import { proficiencyLevels } from '../../domain/cv/defaults'
import type { TemplateProps } from '../types'

const styles = StyleSheet.create({
  section: { marginTop: 17 },
  heading: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    paddingBottom: 5,
    marginBottom: 9,
    borderBottomWidth: 0.6,
  },
  entry: { marginBottom: 12 },
  entryTitle: { fontWeight: 700, marginBottom: 3 },
  metadata: { color: '#626b69', fontSize: 9, marginBottom: 5 },
  body: { lineHeight: 1.55 },
  bullet: { marginBottom: 3, lineHeight: 1.5 },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 44,
    right: 44,
    fontSize: 8,
    color: '#626b69',
    textAlign: 'right',
  },
})

function Description({
  text,
  bullets = false,
}: {
  text: string
  bullets?: boolean
}) {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line, index) => (
      <Text key={index} style={styles.bullet} orphans={2} widows={2}>
        {bullets ? `\u2022  ${line}` : line}
      </Text>
    ))
}

export function ContactLine({ cv }: Pick<TemplateProps, 'cv'>) {
  const { email, phone, location, website, linkedin } = cv.personal
  return (
    <ContactText
      style={{ fontSize: 9, lineHeight: 1.7, color: '#626b69' }}
      values={[email, phone, location, website, linkedin]}
      separator="  |  "
    />
  )
}

export function Portrait({ cv }: Pick<TemplateProps, 'cv'>) {
  return cv.personal.portrait ? (
    <Image
      src={cv.personal.portrait}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        objectFit: 'cover',
        alignSelf: 'center',
        marginBottom: 12,
      }}
    />
  ) : null
}

export function CvSections({
  cv,
  appearance,
  variant = 'standard',
}: TemplateProps & { variant?: 'standard' | 'sidebar' }) {
  const { t, heading, dates: dateRange } = usePdfTranslation()
  const sidebar = variant === 'sidebar'
  const headingStyle = sidebar
    ? {
        fontFamily: 'Times-Bold',
        fontSize: 15,
        marginBottom: 7,
      }
    : {
        ...styles.heading,
        color: appearance.accent,
        borderBottomColor: appearance.colors?.accent ?? appearance.accent,
      }
  const sectionStyle = sidebar ? { marginTop: 16 } : styles.section
  const experience = cv.experience.filter(
    (entry) => entry.role || entry.employer || entry.description,
  )
  const education = cv.education.filter(
    (entry) => entry.degree || entry.school || entry.description,
  )
  const projects = cv.projects.filter(
    (entry) => entry.name || entry.description || entry.url,
  )
  const skills = cv.skills.filter((skill) => skill.name.trim())
  const references = cv.references.filter((entry) =>
    [
      entry.name,
      entry.jobTitle,
      entry.organization,
      entry.email,
      entry.phone,
    ].some((value) => value.trim()),
  )
  return (
    <>
      {cv.summary.trim() && (
        <View style={sectionStyle}>
          <Text
            section="summary"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={35}
          >
            {heading('summary')}
          </Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {cv.summary}
          </Text>
        </View>
      )}
      {experience.length > 0 && (
        <View style={sectionStyle}>
          <Text
            section="experience"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={65}
          >
            {heading('experience')}
          </Text>
          {experience.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text
                colorRole="headings"
                style={styles.entryTitle}
                minPresenceAhead={30}
              >
                {entry.role || entry.employer}
              </Text>
              <Text
                colorRole="details"
                style={styles.metadata}
                minPresenceAhead={20}
              >
                {[
                  entry.role ? entry.employer : '',
                  entry.location,
                  dateRange(entry.startDate, entry.endDate, entry.current),
                ]
                  .filter(Boolean)
                  .join('  |  ')}
              </Text>
              <Description text={entry.description} bullets={sidebar} />
            </View>
          ))}
        </View>
      )}
      {education.length > 0 && (
        <View style={sectionStyle}>
          <Text
            section="education"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={55}
          >
            {heading('education')}
          </Text>
          {education.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text
                colorRole="headings"
                style={styles.entryTitle}
                minPresenceAhead={30}
              >
                {entry.degree || entry.school}
              </Text>
              <Text
                colorRole="details"
                style={styles.metadata}
                minPresenceAhead={20}
              >
                {[
                  entry.degree ? entry.school : '',
                  dateRange(entry.startDate, entry.endDate),
                ]
                  .filter(Boolean)
                  .join('  |  ')}
              </Text>
              <Description text={entry.description} bullets={sidebar} />
            </View>
          ))}
        </View>
      )}
      {!sidebar && skills.length > 0 && (
        <View style={styles.section}>
          <Text
            section="skills"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={30}
          >
            {heading('skills')}
          </Text>
          <Text style={styles.body}>
            {skills.map((skill, index) => (
              <Text key={skill.id}>
                {index > 0 ? '  /  ' : ''}
                {skill.name}
                {skill.level !== null && (
                  <Text colorRole="details">{` (${t(proficiencyLevels[skill.level - 1]!)})`}</Text>
                )}
              </Text>
            ))}
          </Text>
        </View>
      )}
      {projects.length > 0 && (
        <View style={sectionStyle}>
          <Text
            section="projects"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={55}
          >
            {heading('projects')}
          </Text>
          {projects.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text
                colorRole="headings"
                style={styles.entryTitle}
                minPresenceAhead={30}
              >
                {entry.name}
              </Text>
              {entry.url && (
                <Text colorRole="details" style={styles.metadata}>
                  {entry.url}
                </Text>
              )}
              <Description text={entry.description} />
            </View>
          ))}
        </View>
      )}
      {!sidebar && cv.languages.some((language) => language.trim()) && (
        <View style={styles.section}>
          <Text
            section="languages"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={30}
          >
            {heading('languages')}
          </Text>
          <Text style={styles.body}>{cv.languages.join('  /  ')}</Text>
        </View>
      )}
      {cv.certifications.some((certification) => certification.trim()) && (
        <View style={sectionStyle}>
          <Text
            section="certifications"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={30}
          >
            {heading('certifications')}
          </Text>
          <Description text={cv.certifications.join('\n')} />
        </View>
      )}
      {references.length > 0 && (
        <View style={sectionStyle}>
          <Text
            section="references"
            colorRole="headings"
            style={headingStyle}
            minPresenceAhead={45}
          >
            {heading('references')}
          </Text>
          {references.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text
                colorRole="headings"
                style={styles.entryTitle}
                minPresenceAhead={20}
              >
                {[entry.name, entry.jobTitle, entry.organization]
                  .filter(Boolean)
                  .join(' - ')}
              </Text>
              <Text colorRole="details" style={styles.body}>
                {[entry.email, entry.phone].filter(Boolean).join('  |  ')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  )
}

export function PageNumber() {
  return (
    <Text
      colorRole="details"
      fixed
      style={styles.footer}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  )
}
