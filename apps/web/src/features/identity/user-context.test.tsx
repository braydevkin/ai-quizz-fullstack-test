import type { User } from '@quiz/shared'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserProvider, useUser } from './user-context'

jest.mock('../../services/user.service')

import { getUser, identify } from '../../services/user.service'

const mockGetUser = jest.mocked(getUser)
const mockIdentify = jest.mocked(identify)

const user: User = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'ada@example.com',
  name: 'Ada',
}

/** A tiny consumer that surfaces the context so tests can assert on it. */
function Probe() {
  const { user, status, identify, signOut } = useUser()

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="name">{user?.name ?? '—'}</span>
      <button onClick={() => void identify('Ada', 'ada@example.com')}>identify</button>
      <button onClick={signOut}>signOut</button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <UserProvider>
      <Probe />
    </UserProvider>,
  )

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

it('lands anonymous when nothing is remembered', async () => {
  renderProbe()

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
  expect(screen.getByTestId('name')).toHaveTextContent('—')
  expect(mockGetUser).not.toHaveBeenCalled()
})

it('rehydrates the remembered user on mount', async () => {
  localStorage.setItem('quiz.user', JSON.stringify(user.id))
  mockGetUser.mockResolvedValue(user)

  renderProbe()

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
  expect(screen.getByTestId('name')).toHaveTextContent('Ada')
  expect(mockGetUser).toHaveBeenCalledWith(user.id)
})

it('forgets an id that no longer resolves', async () => {
  localStorage.setItem('quiz.user', JSON.stringify('stale-id'))
  mockGetUser.mockRejectedValue(new Error('404'))

  renderProbe()

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
  expect(localStorage.getItem('quiz.user')).toBeNull()
})

it('remembers the user after identify and clears on sign out', async () => {
  mockIdentify.mockResolvedValue(user)
  renderProbe()

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))

  await userEvent.click(screen.getByRole('button', { name: 'identify' }))

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
  expect(screen.getByTestId('name')).toHaveTextContent('Ada')
  expect(JSON.parse(localStorage.getItem('quiz.user') ?? 'null')).toBe(user.id)

  await userEvent.click(screen.getByRole('button', { name: 'signOut' }))

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
  expect(localStorage.getItem('quiz.user')).toBeNull()
})
