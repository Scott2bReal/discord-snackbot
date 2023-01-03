export function logJSON(json: object, message?: string) {
  if (message !== undefined) {
    console.log(`${message}:`, JSON.stringify(json, null, 2))
  } else {
    console.log(JSON.stringify(json, null, 2))
  }
}
