import { Button, Card, Dialog, DialogBody, H2 } from '@blueprintjs/core'
import React, { ReactElement, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import { ActivityLogConfig } from '../../project-configs/getProjectConfig'
import { loadActivityLog } from './ActivityLog'

const ActivityDialog = styled(Dialog)`
  max-height: 800px;
  min-width: 800px;
`

const ActivityDialogBody = styled(DialogBody)`
  padding: 0;
  overflow-x: hidden;
`

const StickyTableHeader = styled.thead`
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 2;
`

const EmptyLog = styled.div`
  margin: 12px;
`

const StyledTable = styled.table`
  border-spacing: 0;
  min-width: 800px;
  overflow-x: hidden;

  & tbody tr:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  & td,
  & th {
    margin: 0;
    padding: 16px;
    text-align: center;
  }

  & th {
    position: sticky;
    top: 0;
    background: white;
    border-top: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
  }
`
const ActivityLogCard = ({ activityLogConfig }: { activityLogConfig: ActivityLogConfig }): ReactElement => {
  const { t } = useTranslation('userSettings')
  const [openLog, setOpenLog] = useState<boolean>(false)
  const { card: cardConfig } = useContext(ProjectConfigContext)
  const activityLogSorted = loadActivityLog(cardConfig).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Card style={{ width: '500px' }}>
          <H2>{t('activityLog')}</H2>
          <p>{t('activityLogDescription')}</p>
          <div style={{ textAlign: 'right', padding: '10px 0' }}>
            <Button text={t('viewActivity')} intent='primary' onClick={() => setOpenLog(true)} />
          </div>
        </Card>
      </div>
      <ActivityDialog isOpen={openLog} title={t('activityLog')} onClose={() => setOpenLog(false)} isCloseButtonShown>
        <ActivityDialogBody>
          <StyledTable>
            <StickyTableHeader>
              <tr>
                {activityLogConfig.columnNames.map(columnName => (
                  <th key={columnName}>{columnName}</th>
                ))}
              </tr>
            </StickyTableHeader>
            <tbody>
              {activityLogSorted.length > 0 ? (
                activityLogSorted.map(activityLogConfig.renderLogEntry)
              ) : (
                <EmptyLog>{t('noEntries')}</EmptyLog>
              )}
            </tbody>
          </StyledTable>
        </ActivityDialogBody>
      </ActivityDialog>
    </>
  )
}

export default ActivityLogCard
