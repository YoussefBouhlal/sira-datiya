import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  FileText,
  LoaderCircle,
} from 'lucide-react'
import { useState } from 'react'
import type { Appearance, CvData } from '../../domain/cv/types'
import { documentFilename, downloadBlob } from '../../lib/download'
import type { TemplateDefinition, TemplateOption } from '../../templates/types'
import { PdfCanvas } from './PdfCanvas'
import { usePdfDocument } from './use-pdf-document'

export function PdfWorkspace({
  cv,
  appearance,
  template,
  options,
  onTemplateChange,
}: {
  cv: CvData
  appearance: Appearance
  template: TemplateDefinition
  options: readonly TemplateOption[]
  onTemplateChange: (id: string) => void
}) {
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
          PREVIEW
        </span>
        <button
          type="button"
          className="button button-primary download-button"
          disabled={!canDownload}
          title={
            !cv.personal.fullName.trim()
              ? 'Add your name to download'
              : 'Download PDF'
          }
          onClick={() => {
            if (blob)
              downloadBlob(blob, documentFilename(cv.personal.fullName, 'pdf'))
          }}
        >
          {loading ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <ArrowDownToLine size={16} />
          )}
          <span>Download PDF</span>
        </button>
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
              <span>Preparing your document</span>
            </div>
          )}
        </div>
        <div className="preview-status" role="status">
          {error ||
            (loading
              ? 'Updating preview...'
              : `${template.name} / ${appearance.pageSize === 'LETTER' ? 'US Letter' : 'A4'}`)}
        </div>
        <div className="preview-pagination">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous preview page"
            title="Previous page"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {currentPage} <span className="muted">of {pageCount}</span>
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Next preview page"
            title="Next page"
            disabled={currentPage >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        className="quick-templates"
        role="group"
        aria-label="Preview template"
      >
        <span>TEMPLATE</span>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={appearance.templateId === option.id}
            onClick={() => onTemplateChange(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
      <section className="sr-only" aria-label="CV preview text">
        <h2>{cv.personal.fullName || 'Your name'}</h2>
        {Object.entries(cv.personal)
          .filter(([key]) => key !== 'fullName')
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
              entry.current ? 'Present' : entry.endDate,
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
        <p>{cv.skills.join(', ')}</p>
        <p>{cv.languages.join(', ')}</p>
        <p>{cv.certifications.join(', ')}</p>
        {cv.projects.map((entry) => (
          <p key={entry.id}>
            {entry.name}. {entry.url}. {entry.description}
          </p>
        ))}
      </section>
    </>
  )
}
