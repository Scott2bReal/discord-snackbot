export function isValidDate(date: string) {
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/
  return dateFormat.test(date)
}
