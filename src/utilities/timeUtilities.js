export function getDateString(milliseconds=null) {
  let time
  if(milliseconds) time = new Date(milliseconds);
  else time = new Date();

  let day = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  let hour = time.getHours();
  let minutes = time.getMinutes();
  let seconds = time.getSeconds();

  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;
  if (hour < 10) hour = "0" + hour;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${day}/${month}/${year}-${hour}:${minutes}:${seconds}`;
}

export function parseDateString(dateString) {
  const [dateValues, timeValues] = dateString.split("-");
  const [day, month, year] = dateValues.split("/");
  const [hours, minutes, seconds] = timeValues.split(":");
  const date = new Date(+year, month - 1, +day, +hours, +minutes, +seconds);
  return date;
}

export function remainingTimeString(futureDate) {
  const now = new Date();
  let seconds = (futureDate.getTime() - now.getTime()) / 1000;

  let days = Math.floor(seconds / 86400);
  seconds -= days * 86400;

  let hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  seconds = Math.floor(seconds);

  if (days < 10) days = "0" + days;
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
