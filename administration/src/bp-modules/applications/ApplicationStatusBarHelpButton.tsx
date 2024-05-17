import { Button, H4, Popover } from '@blueprintjs/core'
import styled from 'styled-components'

const HelpButton = styled(Button)`
  margin: 0 10px;
`

const Description = styled.ul`
  margin: 4px 0;
`

const ApplicationStatusHelpButton = () => {
  return (
    <Popover
      content={
        <div style={{ padding: '10px' }}>
          <H4 style={{ textAlign: 'center' }}>Welcher Status hat welche Bedeutung?</H4>
          <Description>
            <li>
              <b>Offen:</b>
              <Description>
                Alle Anträge, die weder von allen Organisation abgelehnt noch akzeptiert wurden.
                <br />
                Der Antrag kann i.d.R. nicht bearbeitet werden.
              </Description>
            </li>
            <li>
              <b>Akzeptiert:</b>
              <Description>
                Alle Organisationen haben den Antrag verifiziert.
                <br />
                Der Antrag kann bearbeitet werden.
              </Description>
            </li>
            <li>
              <b>Abgelehnt:</b>
              <Description>
                Alle Organisationen haben den Antrag abgelehnt.
                <br />
                Der Antrag kann gelöscht werden.
              </Description>
            </li>
            <li>
              <b>Zurückgezogen:</b>
              <Description>
                Der Antragssteller hat den Antrag zurückgezogen.
                <br />
                Der Antrag kann gelöscht werden.
              </Description>
            </li>
          </Description>
        </div>
      }>
      <HelpButton icon='help' minimal />
    </Popover>
  )
}

export default ApplicationStatusHelpButton