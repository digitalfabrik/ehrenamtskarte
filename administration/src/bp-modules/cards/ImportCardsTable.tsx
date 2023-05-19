import { Cell, Column, Table2, TruncatedFormat2 } from '@blueprintjs/table'
import '@blueprintjs/table/lib/css/table.css'
import { useCallback } from 'react'
import styled from 'styled-components'

import CSVCard from '../../cards/CSVCard'
import { CardBlueprint } from '../../cards/CardBlueprint'

type CardImportTableProps = {
  headers: string[]
  cardBlueprints: CardBlueprint[]
}

const TableContainer = styled.div`
  overflow: auto;
  justify-content: center;
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
`

const CardImportTable = ({ headers, cardBlueprints }: CardImportTableProps) => {
  const cellRenderer = useCallback(
    (rowIndex: number, columnIndex: number) => {
      const cardBlueprint = cardBlueprints[rowIndex] as CSVCard
      const header = headers[columnIndex]
      const valid = cardBlueprint.isValueValid(header)
      const value = cardBlueprint.getValue(header)
      return (
        <Cell
          key={rowIndex + '-' + columnIndex}
          style={{ fontSize: '0.85rem' }}
          tooltip={!valid ? 'Validierungsfehler' : undefined}
          intent={!valid ? 'danger' : 'none'}>
          <TruncatedFormat2 detectTruncation={true}>{!!value ? value : '-'}</TruncatedFormat2>
        </Cell>
      )
    },
    [cardBlueprints, headers]
  )

  return (
    <TableContainer>
      <Table2 numRows={cardBlueprints.length} enableGhostCells minRowHeight={16}>
        {headers.map((name, idx) => (
          <Column key={idx} name={name} cellRenderer={cellRenderer} />
        ))}
      </Table2>
    </TableContainer>
  )
}

export default CardImportTable
