export function logJSON(json: object, message?: string) {
  if (message !== undefined) {
    console.log(`${message}:`, JSON.stringify(json, null, 2))
  } else {
    console.log(JSON.stringify(json, null, 2))
  }
}

export function isValidDate(date: string) {
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/
  return dateFormat.test(date)
}

export function isValidLocation(location: string) {
  const locationFormat = /^[A-Za-z]+,\s[A-Za-z]{2}$/
  return locationFormat.test(location)
}

export function getShowData(message: any) {
  const showData: { [key: string]: string } = {}
  const location = message.data.components[3].components[0].value
  const locationData = location.split(',') as string[]

  // Hoooo boy
  showData.venueName = message.data.components[0].components[0].value
  showData.subtitle = message.data.components[1].components[0].value ?? ''
  showData.date = message.data.components[2].components[0].value ?? ''
  showData.city = locationData[0]
  showData.state = locationData[1].replace(' ', '')
  showData.ticketLink = message.data.components[4].components[0].value ?? ''

  return showData
}
