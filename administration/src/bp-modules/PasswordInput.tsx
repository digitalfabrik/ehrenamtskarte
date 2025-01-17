import { Button, InputGroup, InputGroupProps2, Label, Tooltip } from '@blueprintjs/core'
import { TFunction } from 'i18next'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ShowPasswordButton = ({ hidden, onClick, t }: { hidden: boolean; onClick: () => void; t: TFunction }) => (
  <Tooltip
    content={hidden ? t('showPassword') : t('hidePassword')}
    renderTarget={({ isOpen, ref, ...tooltipProps }) => (
      <Button ref={ref} {...tooltipProps} minimal icon={hidden ? 'eye-open' : 'eye-off'} onClick={onClick} />
    )}
  />
)

const PasswordInput = ({
  label,
  setValue,
  ...otherProps
}: InputGroupProps2 & {
  label: string
  setValue: ((value: string) => void) | null
}): ReactElement => {
  const { t } = useTranslation('misc')
  const [passwordHidden, setPasswordHidden] = useState(true)
  return (
    <Label>
      {label}
      <InputGroup
        placeholder={label}
        {...otherProps}
        type={passwordHidden ? 'password' : 'text'}
        onChange={event => setValue?.(event.currentTarget.value)}
        readOnly={setValue === null}
        rightElement={
          <ShowPasswordButton hidden={passwordHidden} onClick={() => setPasswordHidden(!passwordHidden)} t={t} />
        }
      />
    </Label>
  )
}

export default PasswordInput
