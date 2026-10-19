import { StyleSheet, Text, View } from '@react-pdf/renderer'
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

function formatMonth(value: string): string {
  if (!value) return ''
  const [year, month] = value.split('-')
  const names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${names[Number(month) - 1] ?? ''} ${year}`.trim()
}

function dateRange(start: string, end: string, current = false): string {
  return [formatMonth(start), current ? 'Present' : formatMonth(end)]
    .filter(Boolean)
    .join(' - ')
}

function Description({ text }: { text: string }) {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line, index) => (
      <Text key={index} style={styles.bullet} orphans={2} widows={2}>
        {line}
      </Text>
    ))
}

export function ContactLine({ cv }: Pick<TemplateProps, 'cv'>) {
  const { email, phone, location, website, linkedin } = cv.personal
  return (
    <Text style={{ fontSize: 9, lineHeight: 1.7, color: '#626b69' }}>
      {[email, phone, location, website, linkedin]
        .filter(Boolean)
        .join('  |  ')}
    </Text>
  )
}

export function CvSections({ cv, appearance }: TemplateProps) {
  const headingStyle = {
    ...styles.heading,
    color: appearance.accent,
    borderBottomColor: appearance.accent,
  }
  const experience = cv.experience.filter(
    (entry) => entry.role || entry.employer || entry.description,
  )
  const education = cv.education.filter(
    (entry) => entry.degree || entry.school || entry.description,
  )
  const projects = cv.projects.filter(
    (entry) => entry.name || entry.description || entry.url,
  )
  return (
    <>
      {cv.summary.trim() && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={35}>
            Profile
          </Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {cv.summary}
          </Text>
        </View>
      )}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={65}>
            Experience
          </Text>
          {experience.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text style={styles.entryTitle} minPresenceAhead={30}>
                {entry.role || entry.employer}
              </Text>
              <Text style={styles.metadata} minPresenceAhead={20}>
                {[
                  entry.role ? entry.employer : '',
                  entry.location,
                  dateRange(entry.startDate, entry.endDate, entry.current),
                ]
                  .filter(Boolean)
                  .join('  |  ')}
              </Text>
              <Description text={entry.description} />
            </View>
          ))}
        </View>
      )}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={55}>
            Education
          </Text>
          {education.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text style={styles.entryTitle} minPresenceAhead={30}>
                {entry.degree || entry.school}
              </Text>
              <Text style={styles.metadata} minPresenceAhead={20}>
                {[
                  entry.degree ? entry.school : '',
                  dateRange(entry.startDate, entry.endDate),
                ]
                  .filter(Boolean)
                  .join('  |  ')}
              </Text>
              <Description text={entry.description} />
            </View>
          ))}
        </View>
      )}
      {cv.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={30}>
            Skills
          </Text>
          <Text style={styles.body}>{cv.skills.join('  /  ')}</Text>
        </View>
      )}
      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={55}>
            Projects
          </Text>
          {projects.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text style={styles.entryTitle} minPresenceAhead={30}>
                {entry.name}
              </Text>
              {entry.url && <Text style={styles.metadata}>{entry.url}</Text>}
              <Description text={entry.description} />
            </View>
          ))}
        </View>
      )}
      {cv.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={30}>
            Languages
          </Text>
          <Text style={styles.body}>{cv.languages.join('  /  ')}</Text>
        </View>
      )}
      {cv.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={headingStyle} minPresenceAhead={30}>
            Certifications
          </Text>
          <Description text={cv.certifications.join('\n')} />
        </View>
      )}
    </>
  )
}

export function PageNumber() {
  return (
    <Text
      fixed
      style={styles.footer}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  )
}
