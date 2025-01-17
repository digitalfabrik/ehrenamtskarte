export enum ApplicationStatus {
  fullyVerified,
  fullyRejected,
  withdrawed,
  ambiguous,
}

export type ApplicationStatusBarItemType = {
  title: string
  status?: ApplicationStatus
}

export const barItems: ApplicationStatusBarItemType[] = [
  {
    title: 'allApplications',
    status: undefined,
  },
  {
    title: 'accepted',
    status: ApplicationStatus.fullyVerified,
  },
  {
    title: 'rejected',
    status: ApplicationStatus.fullyRejected,
  },
  {
    title: 'withdrawed',
    status: ApplicationStatus.withdrawed,
  },
  {
    title: 'open',
    status: ApplicationStatus.ambiguous,
  },
]
