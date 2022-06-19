import * as fs from 'fs'
import * as pdf from 'html-pdf'

import {
  guestListPath,
  appConfigPath,
  invitationsOutputPath
} from './constants.js'

import {
  readAppConfig
} from './common.js'

function readGuestNames(filePath) {

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

    // extract names
    const guestNames = []

    for (const entry of temp) {
      const guestName = entry.split(',')[0]
      guestNames.push(guestName)
    }

    return guestNames

  } catch (err) {
    console.error(err)
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf-8' })
}

function readInvitationTemplate(filePath) {

  const invitationTemplate = readFile(filePath)

  return invitationTemplate
}


function readTemplates(guestNames) {

  const templates = []

  for (const guest of guestNames) {
    const filepath = `./temp-invitations/${guest}.html`
    templates.push(readInvitationTemplate(filepath))
  }

  return templates

}

export function createInvitationPDFs(guestNames, templates) {

  const appConfig = readAppConfig(appConfigPath)

  const { onBehalfOf } = appConfig

  const partnerName = onBehalfOf === 'groom' ? appConfig.groom.name : appConfig.bride.name

  for (let i = 0; i < guestNames.length; i++) {

    const guest = guestNames[i]
    const htmlTemplate = templates[i]

    const options = {
      height: "896px",
      width: "598px",
      localUrlAccess: true,
      quality: "100"
    };

    const outputFilePath = `${invitationsOutputPath}/${guest} - ${partnerName} Wedding Invitation.pdf`

    pdf.create(htmlTemplate, options).toFile(outputFilePath, function (err, res) {
      if (err) return console.log(err);

      console.log(res);
    });

  }
}


function init() {

  const guestNames = readGuestNames(guestListPath)
  const templates = readTemplates(guestNames)
  createInvitationPDFs(guestNames, templates)

}

init()







