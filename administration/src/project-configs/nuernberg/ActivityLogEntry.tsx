import { ReactNode } from 'react'

import { ActivityLog } from '../../bp-modules/user-settings/ActivityLog'
import { JSONCardBlueprint } from '../../cards/CardBlueprint'
import BirthdayExtension from '../../cards/extensions/BirthdayExtension'
import NuernbergPassNumberExtension from '../../cards/extensions/NuernbergPassNumberExtension'
import { ExtensionClass } from '../../cards/extensions/extensions'
import PlainDate from '../../util/PlainDate'

const findByExtensionClass = <T extends ExtensionClass>(
  card: JSONCardBlueprint,
  extensionClass: T
): InstanceType<T> | undefined =>
  card.extensions.find(extension => extension.name === extensionClass.name) as InstanceType<T> | undefined

// Check column names of the activityLogConfig have the same order and amount than here
const ActivityLogEntry = (logEntry: ActivityLog): ReactNode => {
  const { card, timestamp } = logEntry
  const birthdayExtension = findByExtensionClass(card, BirthdayExtension)
  const passNumberExtension = findByExtensionClass(card, NuernbergPassNumberExtension)

  return (
    <tr key={card.id}>
      <td>{timestamp}</td>
      <td>{card.fullName}</td>
      {passNumberExtension && <td>{passNumberExtension.state?.passNumber}</td>}
      {birthdayExtension && (
        <td>{PlainDate.fromDaysSinceEpoch(birthdayExtension.state?.birthday ?? 0).format('dd.MM.yyyy')}</td>
      )}
      {card.expirationDate && <td>{PlainDate.from(card.expirationDate).format('dd.MM.yyyy')}</td>}
    </tr>
  )
}

export default ActivityLogEntry
