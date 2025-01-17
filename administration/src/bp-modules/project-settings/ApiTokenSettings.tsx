import { Alert, Button, H2, H4, HTMLSelect, HTMLTable } from '@blueprintjs/core'
import Delete from '@mui/icons-material/Delete'
import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import getMessageFromApolloError from '../../errors/getMessageFromApolloError'
import {
  ApiTokenMetaData,
  useCreateApiTokenMutation,
  useDeleteApiTokenMutation,
  useGetApiTokenMetaDataQuery,
} from '../../generated/graphql'
import { formatDate } from '../../util/formatDate'
import { useAppToaster } from '../AppToaster'
import SettingsCard from '../user-settings/SettingsCard'
import getQueryResult from '../util/getQueryResult'
import PepperSettings from './PepperSettings'

const Container = styled.div`
  background: ghostwhite;
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
`

const Row = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`

const NewTokenText = styled.p`
  font-size: 18px;
  padding: 10px;
  border: 1px solid black;
  border-radius: 6px;
  margin-top: 15px;
  word-break: break-all;
`

const TableData = styled.td`
  vertical-align: middle !important;
`

const DeleteIcon = styled(Delete)`
  display: block !important;
  cursor: pointer;
`

type ApiTokenSettingsProps = {
  showPepperSection: boolean
}
const ApiTokenSettings = ({ showPepperSection }: ApiTokenSettingsProps): ReactElement => {
  const metaDataQuery = useGetApiTokenMetaDataQuery({})

  const appToaster = useAppToaster()
  const { t } = useTranslation('projectSettings')

  const [tokenMetaData, setTokenMetadata] = useState<Array<ApiTokenMetaData>>([])
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number>(1)

  const [tokenToDelete, setTokenToDelete] = useState<number | null>(null)

  useEffect(() => {
    const metaDataQueryResult = getQueryResult(metaDataQuery)
    if (metaDataQueryResult.successful) {
      const { tokenMetaData } = metaDataQueryResult.data
      setTokenMetadata(tokenMetaData)
    }
  }, [metaDataQuery])

  const [createToken] = useCreateApiTokenMutation({
    onCompleted: result => {
      appToaster?.show({ intent: 'success', message: t('tokenCreateSuccessMessage') })
      setCreatedToken(result.createApiTokenPayload)
      metaDataQuery.refetch()
    },
    onError: error => {
      const { title } = getMessageFromApolloError(error)
      appToaster?.show({
        intent: 'danger',
        message: title,
      })
    },
  })

  const [deleteToken] = useDeleteApiTokenMutation({
    onCompleted: () => {
      appToaster?.show({ intent: 'success', message: t('tokenDeleteSuccessMessage') })
      metaDataQuery.refetch()
    },
    onError: error => {
      const { title } = getMessageFromApolloError(error)
      appToaster?.show({
        intent: 'danger',
        message: title,
      })
    },
  })

  return (
    <>
      <Alert
        cancelButtonText={t('cancel')}
        confirmButtonText={t('deleteToken')}
        icon='trash'
        intent='danger'
        isOpen={tokenToDelete !== null}
        onCancel={() => setTokenToDelete(null)}
        onConfirm={() => {
          if (tokenToDelete !== null) {
            deleteToken({ variables: { id: tokenToDelete } })
            setTokenToDelete(null)
          }
        }}>
        <p>{t('deleteTokenConfirmationPrompt')}</p>
      </Alert>
      <SettingsCard>
        <H2>{t('apiToken')}</H2>
        {showPepperSection && <PepperSettings />}
        <Container>
          <H4>{t('createNewToken')}</H4>
          <p>{t('tokenOnlyShowedOnceHint')}</p>
          <Row>
            <label htmlFor='expiresIn'>{t('validPeriod')}:</label>
            <HTMLSelect
              name='expiresIn'
              id='expiresIn'
              value={expiresIn}
              onChange={e => setExpiresIn(parseInt(e.target.value, 10))}>
              <option value='1'>1 {t('month')}</option>
              <option value='3'>3 {t('months')}</option>
              <option value='12'>1 {t('year')}</option>
              <option value='36'>3 {t('years')}</option>
            </HTMLSelect>
            <Button intent='primary' onClick={() => createToken({ variables: { expiresIn } })}>
              {t('create')}
            </Button>
          </Row>
          {createdToken !== null && (
            <>
              <p>{t('newToken')}:</p>
              <NewTokenText> {createdToken}</NewTokenText>
            </>
          )}
        </Container>

        {tokenMetaData.length > 0 && (
          <HTMLTable>
            <thead>
              <tr>
                <th>{t('eMailOfCreator')}</th>
                <th>{t('expirationDate')}</th>
                <th aria-label='Delete' />
              </tr>
            </thead>
            <tbody>
              {tokenMetaData.map(item => (
                <tr key={item.id}>
                  <TableData>{item.creatorEmail}</TableData>
                  <TableData>{formatDate(item.expirationDate)}</TableData>
                  <TableData>
                    <DeleteIcon color='error' onClick={() => setTokenToDelete(item.id)} />
                  </TableData>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        )}
      </SettingsCard>
    </>
  )
}

export default ApiTokenSettings
