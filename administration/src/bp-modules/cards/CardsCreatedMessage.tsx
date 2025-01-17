import { Button, Icon } from '@blueprintjs/core'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  & > * {
    margin: 20px;
  }
`

type Props = {
  reset: () => void
}

const CardsCreatedMessage = ({ reset }: Props): ReactElement => {
  const { t } = useTranslation('cards')
  return (
    <Container>
      <Icon icon='tick-circle' color='green' iconSize={100} />
      <p>{t('addCardSuccessMessage')}</p>
      <Button onClick={reset}>{t('createMoreCards')}</Button>
    </Container>
  )
}
export default CardsCreatedMessage
