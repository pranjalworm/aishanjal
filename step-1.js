import { appConfigPath, guestListPath, SampleGuests } from './constants.js'
import * as fs from 'fs'

function processConfigData(config) {

  console.log('Processing config data...')

  const csvFields = [
    'Guest Name',
    'With Family',
  ]

  const programmes = config.programmes

  for (const programme of programmes) {

    for (const event of programme.events) {

      if (event.optional) {
        csvFields.push(event.name)
      }
    }
  }

  const fieldsRow = csvFields.join(',') + '\n'

  let guestData = ''

  for (const guest of SampleGuests) {

    const { name, withFamily } = guest
    const guestRow = `${name},${withFamily}\n`

    guestData += guestRow
  }

  const guestCsvData = fieldsRow + guestData

  return guestCsvData
}


function writeCsvFile(filePath, csvData) {

  console.log('Writing Sample CSV file...')

  try {
    fs.writeFileSync(filePath, csvData, { encoding: 'utf-8' })
  } catch (err) {
    console.error(err)
  }

}


function init() {

  const appConfig = readAppConfig(appConfigPath)

  const guestCsvData = processConfigData(appConfig)

  writeCsvFile(guestListPath, guestCsvData)

}

init()