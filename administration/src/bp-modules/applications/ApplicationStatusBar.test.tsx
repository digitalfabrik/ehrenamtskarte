import React from 'react'

import { renderWithTranslation } from '../../testing/render'
import ApplicationStatusBar from './ApplicationStatusBar'
import { Application } from './ApplicationsOverview'
import { barItems } from './constants'

const applications: Application[] = [
  {
    createdDate: '2024-05-15T09:20:23.350015Z',
    id: 1,
    jsonValue: '',
    note: 'neu',
    verifications: [
      {
        contactEmailAddress: 'example@test.de',
        organizationName: 'TürAnTürn',
        rejectedDate: null,
        verifiedDate: '2024-05-15T13:54:11.010430Z',
      },
    ],
    withdrawalDate: null,
  },
  {
    createdDate: '2024-05-15T09:20:23.350015Z',
    id: 2,
    jsonValue: '',
    note: 'neu',
    verifications: [
      {
        contactEmailAddress: 'example@test.de',
        organizationName: 'TürAnTürn',
        rejectedDate: null,
        verifiedDate: '2024-05-15T13:54:11.010430Z',
      },
    ],
    withdrawalDate: null,
  },
  {
    createdDate: '2024-05-15T09:20:23.350015Z',
    id: 3,
    jsonValue: '',
    note: 'test',
    verifications: [
      {
        contactEmailAddress: 'example@test.de',
        organizationName: 'TürAnTürn',
        rejectedDate: null,
        verifiedDate: null,
      },
    ],
    withdrawalDate: null,
  },
  {
    createdDate: '2024-05-15T09:20:23.350015Z',
    id: 4,
    jsonValue: '',
    note: 'test',
    verifications: [
      {
        contactEmailAddress: 'example@test.de',
        organizationName: 'TürAnTürn',
        rejectedDate: null,
        verifiedDate: null,
      },
    ],
    withdrawalDate: '2024-05-15T09:20:23.350015Z',
  },
]

describe('ApplicationStatusBar', () => {
  const setActiveBarItem = jest.fn()
  it('Should show the correct count for all applications', () => {
    const { getByTestId } = renderWithTranslation(
      <ApplicationStatusBar
        applications={applications}
        setActiveBarItem={setActiveBarItem}
        barItems={barItems}
        activeBarItem={barItems[0]}
      />
    )

    const allApplicationsCount = getByTestId('status-Alle Anträge-count')
    expect(allApplicationsCount).toHaveTextContent('4')
  })
  it('Should show the correct count for open applications', () => {
    const { getByTestId } = renderWithTranslation(
      <ApplicationStatusBar
        applications={applications}
        setActiveBarItem={setActiveBarItem}
        barItems={barItems}
        activeBarItem={barItems[0]}
      />
    )

    const openApplicationsCount = getByTestId('status-Offen-count')
    expect(openApplicationsCount).toHaveTextContent('1')
  })
  it('Should show the correct count for withdrawed applications', () => {
    const { getByTestId } = renderWithTranslation(
      <ApplicationStatusBar
        applications={applications}
        setActiveBarItem={setActiveBarItem}
        barItems={barItems}
        activeBarItem={barItems[0]}
      />
    )

    const withdrawedApplicationsCount = getByTestId('status-Zurückgezogen-count')
    expect(withdrawedApplicationsCount).toHaveTextContent('1')
  })
  it('Should show the correct count for rejected applications', () => {
    const { getByTestId } = renderWithTranslation(
      <ApplicationStatusBar
        applications={applications}
        setActiveBarItem={setActiveBarItem}
        barItems={barItems}
        activeBarItem={barItems[0]}
      />
    )

    const rejectedApplicationsCount = getByTestId('status-Abgelehnt-count')
    expect(rejectedApplicationsCount).toHaveTextContent('0')
  })
  it('Should show the correct count for accepted applications', () => {
    const { getByTestId } = renderWithTranslation(
      <ApplicationStatusBar
        applications={applications}
        setActiveBarItem={setActiveBarItem}
        barItems={barItems}
        activeBarItem={barItems[0]}
      />
    )

    const acceptedApplicationsCount = getByTestId('status-Akzeptiert-count')
    expect(acceptedApplicationsCount).toHaveTextContent('2')
  })
})
