import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from './button'

describe('<Button />', () => {
  it('renders its children inside a button element', () => {
    render(<Button>Start quiz</Button>)

    expect(screen.getByRole('button', { name: 'Start quiz' })).toBeInTheDocument()
  })

  it('calls onClick when pressed', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Next question</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Next question' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire when disabled', async () => {
    const onClick = jest.fn()
    render(
      <Button disabled onClick={onClick}>
        Submit
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
