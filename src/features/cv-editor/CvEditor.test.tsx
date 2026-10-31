// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import {
  createEmptyCv,
  createDocument,
  createExperience,
  createReference,
  createSkill,
} from '../../domain/cv/defaults'
import { CvEditor } from './CvEditor'
import { templateRegistry } from '../../templates/registry'

afterEach(cleanup)

it('keeps skill ratings attached to their entries and supports unrated skills', async () => {
  const user = userEvent.setup()
  function Harness() {
    const [cv, setCv] = useState(() => ({
      ...createEmptyCv(),
      skills: [createSkill('first'), createSkill('second')],
    }))
    return (
      <CvEditor
        cv={cv}
        step="skills"
        onChange={setCv}
        appearance={createDocument('modern').appearance}
        template={templateRegistry.resolve('modern')}
        onAppearanceChange={() => {}}
      />
    )
  }
  render(<Harness />)
  await user.type(screen.getAllByLabelText('Skill name')[1]!, 'Communication')
  await user.selectOptions(screen.getAllByLabelText('Proficiency')[1]!, '4')
  await user.click(screen.getByRole('button', { name: 'Remove skill 1' }))
  expect(screen.getByLabelText('Skill name')).toHaveValue('Communication')
  expect(screen.getByLabelText('Proficiency')).toHaveValue('4')
  await user.selectOptions(screen.getByLabelText('Proficiency'), '')
  expect(screen.getByLabelText('Proficiency')).toHaveValue('')
})

it('reorders references without losing contact fields', async () => {
  const user = userEvent.setup()
  function Harness() {
    const [cv, setCv] = useState(() => ({
      ...createEmptyCv(),
      references: [createReference('first'), createReference('second')],
    }))
    return (
      <CvEditor
        cv={cv}
        step="skills"
        onChange={setCv}
        appearance={createDocument('modern').appearance}
        template={templateRegistry.resolve('modern')}
        onAppearanceChange={() => {}}
      />
    )
  }
  render(<Harness />)
  await user.type(
    screen.getAllByLabelText('Reference name')[1]!,
    'Jordan Example',
  )
  await user.type(
    screen.getAllByLabelText('Reference email')[1]!,
    'jordan@example.com',
  )
  await user.click(screen.getByRole('button', { name: 'Move reference 2 up' }))
  expect(screen.getAllByLabelText('Reference name')[0]).toHaveValue(
    'Jordan Example',
  )
  expect(screen.getAllByLabelText('Reference email')[0]).toHaveValue(
    'jordan@example.com',
  )
  await user.click(screen.getByRole('button', { name: 'Remove reference 2' }))
  expect(screen.getByLabelText('Reference name')).toHaveValue('Jordan Example')
})

it('keeps repeatable entry identity when an earlier position is removed', async () => {
  const user = userEvent.setup()
  function Harness() {
    const [cv, setCv] = useState(() => ({
      ...createEmptyCv(),
      experience: [createExperience('first'), createExperience('second')],
    }))
    return (
      <CvEditor
        cv={cv}
        step="experience"
        onChange={setCv}
        appearance={createDocument('modern').appearance}
        template={templateRegistry.resolve('modern')}
        onAppearanceChange={() => {}}
      />
    )
  }
  render(<Harness />)
  await user.type(screen.getAllByLabelText('Job title')[1]!, 'Engineer')
  await user.click(screen.getByRole('button', { name: 'Remove position 1' }))
  expect(screen.getByLabelText('Job title')).toHaveValue('Engineer')
  await user.click(screen.getByLabelText('I currently work here'))
  expect(screen.getByLabelText('End date')).toBeDisabled()
})

it('offers supported proficiency displays and retains the preference across templates', async () => {
  const user = userEvent.setup()
  function Harness() {
    const [document, setDocument] = useState(() => {
      const initial = createDocument('sidebar')
      initial.cv.skills = [{ id: 'rated', name: 'Research', level: 3 }]
      return initial
    })
    return (
      <>
        {templateRegistry.templates.map((template) => (
          <button
            key={template.id}
            onClick={() =>
              setDocument({
                ...document,
                appearance: { ...document.appearance, templateId: template.id },
              })
            }
          >
            {template.id}
          </button>
        ))}
        <CvEditor
          cv={document.cv}
          step="skills"
          onChange={(cv) => setDocument({ ...document, cv })}
          appearance={document.appearance}
          template={templateRegistry.resolve(document.appearance.templateId)}
          onAppearanceChange={(appearance) =>
            setDocument({ ...document, appearance })
          }
        />
      </>
    )
  }
  render(<Harness />)
  const display = screen.getByRole('combobox', { name: 'Proficiency display' })
  expect(display).toHaveValue('both')
  for (const mode of ['text', 'both', 'bar']) {
    await user.selectOptions(display, mode)
    expect(display).toHaveValue(mode)
    expect(screen.getByLabelText('Proficiency')).toHaveValue('3')
    expect(screen.getByLabelText('Skill name')).toHaveValue('Research')
  }
  for (const template of templateRegistry.templates.filter(
    (entry) => entry.id !== 'sidebar',
  )) {
    await user.click(screen.getByRole('button', { name: template.id }))
    expect(
      screen.queryByRole('combobox', { name: 'Proficiency display' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'sidebar' }))
    expect(screen.getByLabelText('Proficiency display')).toHaveValue('bar')
  }
})
