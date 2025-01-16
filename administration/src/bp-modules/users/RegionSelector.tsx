import { Button, Menu } from '@blueprintjs/core'
import { Classes, ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select'
import React, { ReactElement, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Region, useGetRegionsQuery } from '../../generated/graphql'
import { ProjectConfigContext } from '../../project-configs/ProjectConfigContext'
import getQueryResult from '../util/getQueryResult'

const RegionSelect = Select.ofType<Region>()

const getTitle = (region: Region) => `${region.prefix} ${region.name}`

const renderMenu: ItemListRenderer<Region> = ({ itemsParentRef, renderItem, filteredItems }) => {
  const renderedItems = filteredItems.map(renderItem).filter(item => item != null)
  return (
    <Menu ulRef={itemsParentRef} style={{ maxHeight: 500, overflow: 'auto' }}>
      {renderedItems}
    </Menu>
  )
}

const itemRenderer: ItemRenderer<Region> = (region, { handleClick, modifiers }) => (
  <Button
    style={{ display: 'block' }}
    fill
    key={region.id}
    minimal
    onClick={handleClick}
    active={modifiers.active}
    disabled={modifiers.disabled}>
    {getTitle(region)}
  </Button>
)

const RegionSelector = ({
  onSelect,
  selectedId,
}: {
  onSelect: (region: Region) => void
  selectedId: number | null
}): ReactElement => {
  const { t } = useTranslation('users')
  const projectId = useContext(ProjectConfigContext).projectId
  const regionsQuery = useGetRegionsQuery({
    variables: { project: projectId },
  })
  const regionsQueryResult = getQueryResult(regionsQuery, t)

  const regions = useMemo(
    () =>
      regionsQueryResult.successful
        ? [...regionsQueryResult.data.regions].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [regionsQueryResult]
  )

  if (!regionsQueryResult.successful) {
    return regionsQueryResult.component
  }

  const activeItem = regions.find((other: Region) => selectedId === other.id)
  return (
    <RegionSelect
      activeItem={activeItem}
      items={regions}
      itemRenderer={itemRenderer}
      filterable
      itemListPredicate={(filter, items) =>
        items.filter(region => getTitle(region).toLowerCase().includes(filter.toLowerCase()))
      }
      fill
      itemListRenderer={renderMenu}
      onItemSelect={onSelect}>
      <div style={{ position: 'relative' }}>
        {/* Make the browser think there is an actual select element to make it validate the form. */}
        <select
          style={{ height: '30px', opacity: 0, pointerEvents: 'none', position: 'absolute' }}
          value={activeItem?.id ?? ''}
          required
          tabIndex={-1}>
          <option value={activeItem?.id ?? ''} disabled>
            {activeItem ? getTitle(activeItem) : t('select')}
          </option>
        </select>
        <Button
          className={Classes.SELECT_POPOVER}
          style={{ justifyContent: 'space-between', padding: '0 10px' }}
          fill
          rightIcon='double-caret-vertical'>
          {activeItem ? getTitle(activeItem) : t('select')}
        </Button>
      </div>
    </RegionSelect>
  )
}

export default RegionSelector
