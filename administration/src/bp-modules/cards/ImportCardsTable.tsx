import { Cell, Column, Table2, TruncatedFormat } from '@blueprintjs/table'
import '@blueprintjs/table/lib/css/table.css'
import React, { ReactElement, useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Card, getValueByCSVHeader, isValueValid } from '../../cards/Card'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { getCsvHeaders } from '../../project-configs/helper'

const TableContainer = styled.div`
  overflow: auto;
  justify-content: center;
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
`

const StyledCell = styled(Cell)`
  font-size: 0.85rem;
  white-space: break-spaces;
`

type CardImportTableProps = {
  cards: Card[]
}

const CardImportTable = ({ cards }: CardImportTableProps): ReactElement => {
  const projectConfig = useContext(ProjectConfigContext)
  const { card: cardConfig } = projectConfig
  const csvHeaders = getCsvHeaders(projectConfig)
  const { t } = useTranslation('cards')

  const cellRenderer = useCallback(
    (rowIndex: number, columnIndex: number) => {
      const card = cards[rowIndex]
      const header = csvHeaders[columnIndex]
      const valid = isValueValid(card, cardConfig, header)
      const value = getValueByCSVHeader(card, cardConfig, header)
      return (
        <StyledCell
          wrapText
          key={`${rowIndex}-${columnIndex}`}
          tooltip={!valid ? t('validationError') : undefined}
          intent={!valid ? 'danger' : 'none'}>
          <TruncatedFormat detectTruncation preformatted>
            {value?.toString() || '-'}
          </TruncatedFormat>
        </StyledCell>
      )
    },
    [cardConfig, cards, csvHeaders, t]
  )

  return (
    <TableContainer>
      <Table2 numRows={cards.length} enableGhostCells minRowHeight={16}>
        {csvHeaders.map(name => (
          <Column key={name} name={name} cellRenderer={cellRenderer} />
        ))}
      </Table2>
    </TableContainer>
  )
}

export default CardImportTable
