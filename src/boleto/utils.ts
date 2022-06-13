export function millisecondToDay(ms: number) {
  return Math.ceil(ms / (1000 * 3600 * 24));
}

export function dayToMillisecond(days: number) {
  return Math.ceil(days * (1000 * 3600 * 24));
}

export function dateDifferenceInDays(date1, date2) {
  const difference = date1.getTime() - date2.getTime();
  const days = millisecondToDay(difference);
  return days;
}

export function getDecimalValueString(value) {
  return parseFloat(value.slice(0, -2) + '.' + value.slice(-2)).toFixed(2);
}
