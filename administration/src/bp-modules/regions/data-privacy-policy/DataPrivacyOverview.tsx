import { Button, H3, TextArea, Tooltip } from '@blueprintjs/core'
import React, { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import defaultErrorMap from '../../../errors/DefaultErrorMap'
import getMessageFromApolloError from '../../../errors/getMessageFromApolloError'
import { GraphQlExceptionCode, useUpdateDataPolicyMutation } from '../../../generated/graphql'
import { useAppToaster } from '../../AppToaster'
import ButtonBar from '../../ButtonBar'

const Content = styled.div`
  padding: 0 6rem;
  width: 100%;
  z-index: 0;
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
`
const Label = styled(H3)`
  text-align: center;
  margin: 15px;
`

const CharCounter = styled.span<{ $hasError: boolean }>`
  text-align: center;
  align-self: flex-start;
  color: ${props => (props.$hasError ? 'red' : 'black')};
  margin: 15px;
`

type RegionOverviewProps = {
  dataPrivacyPolicy: string
  regionId: number
}

const MAX_CHARS = 20000

const DataPrivacyOverview = ({ dataPrivacyPolicy, regionId }: RegionOverviewProps): ReactElement => {
  const navigate = useNavigate()
  const appToaster = useAppToaster()
  const { t } = useTranslation('regionSettings')
  const [dataPrivacyText, setDataPrivacyText] = useState<string>(dataPrivacyPolicy)
  const [updateDataPrivacy, { loading }] = useUpdateDataPolicyMutation({
    onError: error => {
      const { title } = getMessageFromApolloError(error)
      appToaster?.show({ intent: 'danger', message: title })
    },
    onCompleted: () => appToaster?.show({ intent: 'success', message: t('dataPrivacyChangeSuccessful') }),
  })
  const maxCharsExceeded = dataPrivacyText.length > MAX_CHARS

  const onSave = () => updateDataPrivacy({ variables: { regionId, text: dataPrivacyText } })

  const { title: errorMessage } = defaultErrorMap({
    code: GraphQlExceptionCode.InvalidDataPolicySize,
    maxSize: MAX_CHARS,
  })

  return (
    <>
      <Content>
        <Label>{t('dataPrivacy')}</Label>
        <TextArea
          fill
          onChange={e => setDataPrivacyText(e.target.value)}
          value={dataPrivacyText}
          large
          rows={20}
          placeholder={t('dataPrivacyPlaceholder')}
        />
        <CharCounter $hasError={maxCharsExceeded}>
          {dataPrivacyText.length}/{MAX_CHARS}
        </CharCounter>
      </Content>
      <ButtonBar>
        <Button icon='arrow-left' text={t('back')} onClick={() => navigate(-1)} />
        <Tooltip disabled={!maxCharsExceeded} content={errorMessage}>
          <Button
            disabled={maxCharsExceeded}
            icon='floppy-disk'
            text={t('save')}
            intent='success'
            onClick={onSave}
            loading={loading}
          />
        </Tooltip>
      </ButtonBar>
    </>
  )
}
export default DataPrivacyOverview
