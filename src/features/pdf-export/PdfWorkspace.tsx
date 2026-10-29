import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  FileText,
  LoaderCircle,
} from 'lucide-react'
import { useState } from 'react'
import type { Appearance, CvData } from '../../domain/cv/types'
import { proficiencyLevels } from '../../domain/cv/defaults'
import { documentFilename, downloadBlob } from '../../lib/download'
import type { TemplateDefinition } from '../../templates/types'
import { PdfCanvas } from './PdfCanvas'
import { usePdfDocument } from './use-pdf-document'
import { useTranslation } from '../../i18n/context'

export function PdfWorkspace({
  cv,
  appearance,
  template,
  downloadable = true,
}: {
  cv: CvData
  appearance: Appearance
  template: TemplateDefinition
  downloadable?: boolean
}) {
  const { t } = useTranslation()
  const { blob, loading, error } = usePdfDocument(cv, appearance, template)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const currentPage = Math.min(page, pageCount)
  const canDownload = Boolean(
    blob && !loading && !error && cv.personal.fullName.trim(),
  )
  return (
    <>
      <div className="preview-toolbar">
        <span className="preview-label">
          <span className="live-dot" />
          {t('PREVIEW')}
        </span>
        {downloadable && (
          <button
            type="button"
            className="button button-primary download-button"
            disabled={!canDownload}
            title={t(
              !cv.personal.fullName.trim()
                ? 'Add your name to download'
                : 'Download PDF',
            )}
            onClick={() => {
              if (blob)
                downloadBlob(
                  blob,
                  documentFilename(cv.personal.fullName, 'pdf'),
                )
            }}
          >
            {loading ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <ArrowDownToLine size={16} />
            )}
            <span>{t('Download PDF')}</span>
          </button>
        )}
      </div>
      <div className="preview-stage">
        <div
          className={`pdf-paper ${loading ? 'is-updating' : ''}`}
          style={{
            aspectRatio:
              appearance.pageSize === 'A4' ? '210 / 297' : '8.5 / 11',
          }}
          aria-busy={loading}
        >
          {blob ? (
            <PdfCanvas
              blob={blob}
              page={currentPage}
              onPageCount={setPageCount}
            />
          ) : (
            <div className="preview-placeholder">
              <FileText size={32} strokeWidth={1} />
              <span>{t('Preparing your document')}</span>
            </div>
          )}
        </div>
        <div
          className={error || loading ? 'preview-status' : 'sr-only'}
          role="status"
        >
          {t(error) || (loading ? t('Updating preview...') : '')}
        </div>
        <div className="preview-pagination">
          <button
            type="button"
            className="icon-button"
            aria-label={t('Previous preview page')}
            title={t('Previous page')}
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {t('Page {page} of {total}', {
              page: currentPage,
              total: pageCount,
            })}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={t('Next preview page')}
            title={t('Next page')}
            disabled={currentPage >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <section className="sr-only" aria-label={t('CV preview text')}>
        <h2>{cv.personal.fullName || t('Your name')}</h2>
        {Object.entries(cv.personal)
          .filter(([key]) => key !== 'fullName' && key !== 'portrait')
          .map(([key, value]) => (
            <p key={key}>{value}</p>
          ))}
        <p>{cv.summary}</p>
        {cv.experience.map((entry) => (
          <p key={entry.id}>
            {[
              entry.role,
              entry.employer,
              entry.location,
              entry.startDate,
              entry.current ? t('Present') : entry.endDate,
              entry.description,
            ]
              .filter(Boolean)
              .join('. ')}
          </p>
        ))}
        {cv.education.map((entry) => (
          <p key={entry.id}>
            {[
              entry.degree,
              entry.school,
              entry.startDate,
              entry.endDate,
              entry.description,
            ]
              .filter(Boolean)
              .join('. ')}
          </p>
        ))}
        {cv.personal.portrait && (
          <img
            src={cv.personal.portrait}
            alt={t('{name} portrait', {
              name: cv.personal.fullName || t('CV owner'),
            })}
            width={64}
            height={64}
          />
        )}
        <p>
          {cv.skills
            .map((skill) =>
              skill.level === null
                ? skill.name
                : `${skill.name}: ${t(proficiencyLevels[skill.level - 1]!)}`,
            )
            .join(', ')}
        </p>
        <p>{cv.languages.join(', ')}</p>
        <p>{cv.certifications.join(', ')}</p>
        {cv.projects.map((entry) => (
          <p key={entry.id}>
            {entry.name}. {entry.url}. {entry.description}
          </p>
        ))}
        {cv.references.length > 0 && <h3>{t('References')}</h3>}
        {cv.references.map((entry) => (
          <p key={entry.id}>
            {[
              entry.name,
              entry.jobTitle,
              entry.organization,
              entry.email,
              entry.phone,
            ]
              .filter(Boolean)
              .join('. ')}
          </p>
        ))}
      </section>
    </>
  )
}
