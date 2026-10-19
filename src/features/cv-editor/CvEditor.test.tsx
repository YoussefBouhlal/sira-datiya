// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { createEmptyCv, createExperience } from '../../domain/cv/defaults'
import { CvEditor } from './CvEditor'

afterEach(cleanup)

it('keeps repeatable entry identity when an earlier position is removed', async () => {
  const user = userEvent.setup()
  function Harness() {
    const [cv, setCv] = useState(() => ({
      ...createEmptyCv(),
      experience: [createExperience('first'), createExperience('second')],
    }))
    return <CvEditor cv={cv} step="experience" onChange={setCv} />
  }
  render(<Harness />)
  await user.type(screen.getAllByLabelText('Job title')[1]!, 'Engineer')
  await user.click(screen.getByRole('button', { name: 'Remove position 1' }))
  expect(screen.getByLabelText('Job title')).toHaveValue('Engineer')
  await user.click(screen.getByLabelText('I currently work here'))
  expect(screen.getByLabelText('End date')).toBeDisabled()
})
