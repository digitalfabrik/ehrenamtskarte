import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ApplicationStatusBarItemType } from './constants'

const ItemContainer = styled.button<{ $active: boolean }>`
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 12px;
  text-transform: uppercase;
  border: none;
  background-color: transparent;
  font-weight: bold;
  cursor: pointer;
  :hover {
    background: #8f99a826;
  }
  ${props => props.$active && `background:#8f99a84d`};
`

type ApplicationStatusBarItemProps = {
  item: ApplicationStatusBarItemType
  setActiveBarItem: (item: ApplicationStatusBarItemType) => void
  active: boolean
  count: number
}

const ApplicationStatusBarItem = ({
  item,
  setActiveBarItem,
  active,
  count,
}: ApplicationStatusBarItemProps): ReactElement => {
  const { title } = item
  const { t } = useTranslation('applications')

  return (
    <ItemContainer onClick={() => setActiveBarItem(item)} id={title} $active={active}>
      {t(title)}(<span data-testid={`status-${t(title)}-count`}>{count}</span>)
    </ItemContainer>
  )
}

export default ApplicationStatusBarItem
