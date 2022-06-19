import * as fs from 'fs'
import { readAppConfig, getGuestInfo } from './common.js'
import {
  appConfigPath,
  eventJsx,
  guestListPath,
  tempInvitationsOutputPath,
  invitationTemplatePath,
  TemplateKey_Name1,
  TemplateKey_Name2,
  TemplateKey_FullName1,
  TemplateKey_FullName2,
  TemplateKey_MotherName1,
  TemplateKey_MotherName2,
  TemplateKey_FatherName1,
  TemplateKey_FatherName2,
  TemplateKey_GMotherName1,
  TemplateKey_GMotherName2,
  TemplateKey_GFatherName1,
  TemplateKey_GFatherName2,
  TemplateKey_Event,
  TemplateKey_EventsDay1,
  TemplateKey_EventsDay2,
  TemplateKey_EventsDay3,
  TemplateKey_GuestName,
  TemplateKey_GuestRequest,
  TemplateKey_OnBehalfOf,
  TemplateKey_SelfLocation,
  TemplateKey_SpecialNote,
  TemplateKey_SelfAddress,
  TemplateKey_Partner1GenderPronoun,
  TemplateKey_Partner2GenderPronoun
} from './constants.js'


function readGuestList(filePath) {

  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    const temp = data.split(/\r?\n/)
    const len = temp.length

    // remove last empty row
    if (!temp[len - 1]) {
      temp.pop()
    }

    // remove first header row
    temp.shift()

    const guestList = temp

    return guestList

  } catch (err) {
    console.error(err)
  }
}

function readInvitationTemplate(filePath) {

  return fs.readFileSync(filePath, { encoding: 'utf-8' })
}

function writeSoftInvitations(guests, templateData) {

  for (const guest of guests) {

    const guestInfo = getGuestInfo(guest)
    const modifiedTemplateData = modifyTemplate(guestInfo, templateData)

    writeInvitationHtmlFile(guestInfo, modifiedTemplateData)

  }
}


function modifyTemplate(guestInfo, templateData) {

  const appConfig = readAppConfig(appConfigPath)

  // insert names
  templateData = insertNames(templateData, appConfig)

  // insert event details
  templateData = insertEventDetails(templateData, appConfig.programmes, guestInfo.invitedToLagan)

  // insert guest details
  templateData = insertGuestDetails(templateData, guestInfo)

  // insert guest request
  const guestRequest = appConfig.guestRequest
  templateData = insertGuestRequest(templateData, guestRequest)

  const specialNote = guestInfo.specialNote
  templateData = insertSpecialNote(templateData, specialNote)

  // insert on behalf of name
  const onBehalfOfName = appConfig.onBehalfOfName
  templateData = insertOnBehalfOf(templateData, onBehalfOfName)

  // insert self address
  const selfAddress = appConfig.selfAddress
  templateData = insertSelfAddress(templateData, selfAddress)

  // insert self address Google Maps location
  const selfAddressLocation = appConfig.selfAddressLocation
  templateData = insertSelfAddressLocation(templateData, selfAddressLocation)

  return templateData
}

function insertNames(templateData, appConfig) {

  const { groom, bride, onBehalfOf } = appConfig

  if (onBehalfOf === 'groom') {
    templateData = insertPartner1Names(templateData, groom)
    templateData = insertPartner2Names(templateData, bride)
    templateData = templateData.replace(TemplateKey_Partner1GenderPronoun, 'S/O')
    templateData = templateData.replace(TemplateKey_Partner2GenderPronoun, 'D/O')

  } else {
    templateData = insertPartner1Names(templateData, bride)
    templateData = insertPartner2Names(templateData, groom)
    templateData = templateData.replace(TemplateKey_Partner1GenderPronoun, 'D/O')
    templateData = templateData.replace(TemplateKey_Partner2GenderPronoun, 'S/O')
  }

  return templateData
}

function insertPartner1Names(templateData, partnerData) {

  const { name, mother, father, grandmother, grandfather } = partnerData
  const shortName = name.split(' ')[0]

  templateData = templateData.replace(TemplateKey_Name1, shortName)
  templateData = templateData.replace(TemplateKey_FullName1, name)
  templateData = templateData.replace(TemplateKey_MotherName1, mother)
  templateData = templateData.replace(TemplateKey_FatherName1, father)
  templateData = templateData.replace(TemplateKey_GMotherName1, grandmother)
  templateData = templateData.replace(TemplateKey_GFatherName1, grandfather)

  return templateData

}

function insertPartner2Names(templateData, partnerData) {

  const { name, mother, father, grandmother, grandfather } = partnerData
  const shortName = name.split(' ')[0]

  templateData = templateData.replace(TemplateKey_Name2, shortName)
  templateData = templateData.replace(TemplateKey_FullName2, name)
  templateData = templateData.replace(TemplateKey_MotherName2, mother)
  templateData = templateData.replace(TemplateKey_FatherName2, father)
  templateData = templateData.replace(TemplateKey_GMotherName2, grandmother)
  templateData = templateData.replace(TemplateKey_GFatherName2, grandfather)

  return templateData
}

function insertEventDetails(templateData, programmes, invitedToLagan) {

  const [day1Data, day2Data, day3Data] = programmes

  const day1Events = day1Data.events
  const day2Events = day2Data.events
  // const day3Events = day3Data.events

  templateData = insertDayEventDetails(TemplateKey_EventsDay1, templateData, day1Events, invitedToLagan)
  templateData = insertDayEventDetails(TemplateKey_EventsDay2, templateData, day2Events)
  // templateData = insertDayEventDetails(TemplateKey_EventsDay3, templateData, day3Events)

  return templateData
}

function insertDayEventDetails(templateKey, templateData, dayEvents, invitedToLagan) {

  let eventValue = ''

  for (const event of dayEvents) {

    const { name, time } = event

    if (name === 'Lagan' && invitedToLagan === false) {
      continue
    }

    eventValue += eventJsx.replace(TemplateKey_Event, `${name}, ${time}`)
  }

  templateData = templateData.replace(templateKey, eventValue)

  return templateData
}

function insertGuestDetails(templateData, guestInfo) {

  let { guestName, withFamily } = guestInfo

  const containsTwoNames = guestName.split('&').length === 2

  if (containsTwoNames) {
    const names = guestName.split('&')
    guestName = `${names[0]} <div id="amp-divider">&</div>${names[1]}`

  } else if (withFamily) {
    guestName += '<div id="amp-divider">&</div>family'
  }

  templateData = templateData.replace(TemplateKey_GuestName, guestName)

  return templateData
}

function insertGuestRequest(templateData, guestRequest) {

  templateData = templateData.replace(TemplateKey_GuestRequest, guestRequest)

  return templateData
}

function insertSpecialNote(templateData, specialNote) {

  let specialNoteJsx = ''

  if (specialNote) {
    specialNoteJsx = `<div id="special-note"><span>Special Note:</span> ${specialNote}</div>`
  }

  templateData = templateData.replace(TemplateKey_SpecialNote, specialNoteJsx)

  return templateData
}

function insertOnBehalfOf(templateData, onBehalfOfName) {

  templateData = templateData.replace(TemplateKey_OnBehalfOf, onBehalfOfName)

  return templateData

}

function insertSelfAddress(templateData, selfAddress) {

  templateData = templateData.replace(TemplateKey_SelfAddress, selfAddress)

  return templateData

}

function insertSelfAddressLocation(templateData, selfAddressLocation) {

  templateData = templateData.replace(TemplateKey_SelfLocation, selfAddressLocation)

  return templateData

}

function writeInvitationHtmlFile(guestInfo, templateData) {

  const { guestName } = guestInfo
  const fileName = `${tempInvitationsOutputPath}/${guestName}.html`

  fs.writeFile(fileName, templateData, { encoding: 'utf-8' }, (err) => {

    if (err) {
      console.error(`Writing failed (writeFile): ${err}`)
    }
  })

}

function init() {

  const guestList = readGuestList(guestListPath)
  const templateData = readInvitationTemplate(invitationTemplatePath)

  writeSoftInvitations(guestList, templateData)

}

init()


