import { Button, Classes, FormGroup, InputGroup } from '@blueprintjs/core'
import React, { ChangeEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import PasswordInput from '../PasswordInput'

type Props = {
  loading?: boolean
  email: string
  password: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  onSubmit: () => void
}

const LoginForm = ({ loading, email, password, setEmail, setPassword, onSubmit }: Props): ReactElement => {
  const { t } = useTranslation('auth')
  return (
    <div style={{ marginTop: '20px' }}>
      <form
        onSubmit={event => {
          event.preventDefault()
          onSubmit()
        }}>
        <FormGroup label={t('eMail')}>
          <InputGroup
            placeholder='erika.musterfrau@example.org'
            autoFocus
            autoComplete='on'
            name='email'
            value={email}
            disabled={!!loading}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          />
        </FormGroup>
        <FormGroup label={t('password')}>
          <PasswordInput placeholder='Passwort' value={password} disabled={!!loading} setValue={setPassword} label='' />
        </FormGroup>
        <div
          className={Classes.DIALOG_FOOTER_ACTIONS}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to='/forgot-password'>{t('forgotPassword')}</Link>
          <Button text='Anmelden' type='submit' intent='primary' loading={!!loading} />
        </div>
      </form>
    </div>
  )
}

export default LoginForm
