import { NonIdealState } from '@blueprintjs/core'
import { ResponsiveBar } from '@nivo/bar'
import React, { ReactElement, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CardStatisticsResultModel } from '../../../generated/graphql'
import { ProjectConfigContext } from '../../../project-configs/ProjectConfigContext'
import StatisticsBarTooltip from './StatisticsBarTooltip'

const BarContainer = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  margin-bottom: 70px;
`
type StatisticsBarChartProps = {
  statistics: CardStatisticsResultModel[]
}

const StatisticsBarChart = ({ statistics }: StatisticsBarChartProps): ReactElement => {
  const { cardStatistics } = useContext(ProjectConfigContext)
  const { t } = useTranslation('statistics')
  const barHeight = 50
  const axisHeight = 90

  if (statistics.length === 0 || !cardStatistics.enabled) {
    return (
      <NonIdealState
        icon='warning-sign'
        title={t('noStatisticsAvailable')}
        description={t('noStatisticsAvailableDescription')}
      />
    )
  }

  const statisticKeys = Object.keys(statistics[0]).filter(item => item !== 'region')

  return (
    <BarContainer height={statistics.length * barHeight + axisHeight}>
      <ResponsiveBar
        /* Bar chart starts with the first row at bottom axis, so the data has to be reversed to show alphabetically */
        data={[...statistics].reverse()}
        tooltip={StatisticsBarTooltip}
        keys={[statisticKeys[0], statisticKeys[1]]}
        indexBy='region'
        margin={{ top: 20, right: 300, bottom: 50, left: 300 }}
        innerPadding={2.0}
        padding={0.2}
        groupMode='grouped'
        layout='horizontal'
        colors={[cardStatistics.theme.primaryColor, cardStatistics.theme.primaryColorLight]}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: t('count'),
          legendPosition: 'middle',
          legendOffset: 44,
        }}
        theme={{
          axis: { legend: { text: { fontSize: 14, fontWeight: 700 } } },
          text: { fontSize: 14 },
          labels: { text: { fontSize: 14, fontWeight: 700 } },
        }}
        legends={[
          {
            dataFrom: 'keys',
            data: statisticKeys.map((item, index) => ({
              color: [cardStatistics.theme.primaryColor, cardStatistics.theme.primaryColorLight][index],
              id: item,
              label: t(item)!,
            })),
            anchor: 'top-right',
            direction: 'column',
            translateX: 140,
            translateY: 20,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 30,
            itemDirection: 'left-to-right',
            symbolSize: 20,
          },
        ]}
        role='application'
        ariaLabel='Card statistics bar chart'
        barAriaLabel={e => `${e.id}: ${e.formattedValue} ${t('inRegion')}: ${e.indexValue}`}
      />
    </BarContainer>
  )
}

export default StatisticsBarChart
