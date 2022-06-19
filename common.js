import * as fs from 'fs'
import * as pdf from 'html-pdf'
import * as path from 'path'

import {
  tempInvitationsOutputPath,
  invitationsOutputPath,
  appConfigPath
} from './constants.js'

export function readAppConfig(filePath) {

  console.log('Reading app config...')

  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    const appConfig = JSON.parse(data)

    return appConfig

  } catch (err) {
    console.error('There\'s an issue with app-config.json')
    console.error(err)
  }
}



export function getGuestInfo(guestData) {

  const info = guestData.split(',')
  const guestName = info[0]
  const withFamily = info[1].toLowerCase() === 'yes' ? true : false

  // special case
  let invitedToLagan = true
  let specialNote = ''

  if (info[2]) {
    invitedToLagan = info[2].toLowerCase() === 'yes' ? true : false
  }

  // if (info[2]) {
  //   specialNote = info[2]
  // }

  return {
    guestName,
    withFamily,
    invitedToLagan,
    specialNote
  }
}
