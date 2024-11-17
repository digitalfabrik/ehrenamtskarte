import { PDFForm, PDFTextField, rgb } from 'pdf-lib'

import { getAddressFieldExtensionsValues } from '../../cards/extensions/AddressFieldExtensions'
import { InfoParams } from '../../cards/pdf/PdfTextElement'
import PlainDate from '../../util/PlainDate'
import { PdfConfig } from '../getProjectConfig'
import pdfTemplate from './pdf-template.pdf'

const renderPdfDetails = ({ info }: InfoParams): string => {
  const expirationDay = info.expirationDay
  if (expirationDay === undefined) {
    throw new Error('expirationDay must be defined for Nürnberg')
  }
  const passId = info.extensions?.extensionNuernbergPassId?.passId
  const expirationDate = PlainDate.fromDaysSinceEpoch(expirationDay)
  const birthdayDate = PlainDate.fromDaysSinceEpoch(info.extensions?.extensionBirthday?.birthday ?? 0)
  const startDate = PlainDate.fromDaysSinceEpoch(info.extensions?.extensionStartDay?.startDay ?? 0)
  return `${info.fullName}
Pass-ID: ${passId ?? ''}
Geburtsdatum: ${birthdayDate.format()}
Gültig: ${startDate.format()} bis ${expirationDate.format()}`
}

const createAddressFormFields = (form: PDFForm, pageIdx: number, { info, card }: InfoParams): PDFTextField[] => {
  const [addressLine1, addressLine2, plz, location] = getAddressFieldExtensionsValues(card)

  const nameField = form.createTextField(`${pageIdx}.address.name`)
  const addressLine1Field = form.createTextField(`${pageIdx}.address.line.1`)
  const addressLine2Field = form.createTextField(`${pageIdx}.address.line.2`)
  const plzAndLocationField = form.createTextField(`${pageIdx}.address.location`)

  if (addressLine1 || addressLine2 || plz || location) {
    // avoid only printing the name
    nameField.setText(info.fullName)
  }
  if (addressLine1) {
    addressLine1Field.setText(addressLine1)
  }
  if (addressLine2) {
    addressLine2Field.setText(addressLine2)
  }
  if (plz && location) {
    if (!addressLine2) {
      addressLine2Field.setText(`${plz} ${location}`)
    } else {
      plzAndLocationField.setText(`${plz} ${location}`)
    }
  }
  return [nameField, addressLine1Field, addressLine2Field, plzAndLocationField]
}

const renderPassId = ({ info }: InfoParams): string => {
  const passId = info.extensions?.extensionNuernbergPassId?.passId
  return passId?.toString() ?? ''
}

const renderCardHash = ({ cardInfoHash }: InfoParams): string => cardInfoHash

const pdfConfiguration: PdfConfig = {
  title: 'Nürnberg-Pässe',
  templatePath: pdfTemplate,
  issuer: 'Stadt Nürnberg',
  elements: {
    staticVerificationQrCodes: [
      { x: 53, y: 222, size: 47 },
      { x: 164, y: 243, size: 21 },
    ],
    dynamicActivationQrCodes: [{ x: 122, y: 110, size: 63 }],
    text: [
      { x: 108, y: 243, maxWidth: 52, fontSize: 9, spacing: 5, infoToText: renderPdfDetails },
      { x: 135, y: 85, maxWidth: 44, fontSize: 13, color: rgb(0.17, 0.17, 0.2), infoToText: renderPassId },
      { x: 153.892, y: 178, fontSize: 6, textAlign: 'center', infoToText: renderCardHash },
    ],
    form: [{ infoToFormFields: createAddressFormFields, x: 20, y: 74, width: 85, fontSize: 9 }],
  },
}

export default pdfConfiguration
