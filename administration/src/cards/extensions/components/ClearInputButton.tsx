import CloseIcon from '@mui/icons-material/Close'
import React, { ReactElement } from 'react'
import styled from 'styled-components'

const StyledButton = styled.button<{ $viewportSmall: boolean }>`
  background-color: transparent;
  border: none;
  outline: none;
  display: flex;
  height: ${props => (props.$viewportSmall ? 40 : 30)}px;
  justify-content: center;
  flex-direction: column;
  margin-right: 4px;
  cursor: pointer;
  color: #5f6b7c;
`
type ClearInputButtonProps = { viewportSmall: boolean; onClick: () => void; input?: string }

const ClearInputButton = ({ viewportSmall, onClick, input }: ClearInputButtonProps): ReactElement | null => {
  if (!input || input.length === 0) {
    return null
  }
  return (
    <StyledButton $viewportSmall={viewportSmall} onClick={onClick}>
      <CloseIcon fontSize={viewportSmall ? 'medium' : 'small'} />
    </StyledButton>
  )
}

export default ClearInputButton
