/**
 * Provides a formatted DateTime from the execution moment, or from a definited date using Date(milliseconds) constructor
 * @param  {Number} milliseconds the amount of milliseconds since 01/01/1970 to create a Date Object
 * @return {String}      a formatted dd/mm/yyyy-hh:mm:ss DateTime string
 */
export function getDateString(milliseconds=null) {
  let time
  if(milliseconds) time = new Date(milliseconds);
  else time = new Date();

  //Get all the parts of the DateTime
  let day = time.getDate();
  //Month values start with 0
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  let hour = time.getHours();
  let minutes = time.getMinutes();
  let seconds = time.getSeconds();

  //Add a 0 to required values, like 01/01/2000-02:09:01
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;
  if (hour < 10) hour = "0" + hour;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${day}/${month}/${year}-${hour}:${minutes}:${seconds}`;
}

/**
 * Transforms a formatted dd/mm/yyyy-hh:mm:ss string to a Date Object 
 * @param  {String} dateString the string to transform 
 * @return {Date}      a Date object with the value of the string
 */
export function parseDateString(dateString) {
  const [dateValues, timeValues] = dateString.split("-");
  const [day, month, year] = dateValues.split("/");
  const [hours, minutes, seconds] = timeValues.split(":");
  const date = new Date(+year, month - 1, +day, +hours, +minutes, +seconds);
  return date;
}

/**
 * Obtains the remaining time until a future DateTime in comparison to the actual DateTime
 * @param  {Date} futureDate a Date object with a future date
 * @return {String}      a formatted "00d 00h 00m 00s" string with the remaining time to the received Date
 */
export function remainingTimeString(futureDate) {
  const now = new Date();
  //Getting the total number of milliseconds for both dates, substracting and then converting to milliseconds to seconds
  let seconds = (futureDate.getTime() - now.getTime()) / 1000;

  //86400 seconds in a day, substracting the total possible days
  let days = Math.floor(seconds / 86400);
  seconds -= days * 86400;

  //3600 seconds in a hour, substracting the total possible hours
  let hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  //60 seconds in a minute, substracting the total possible minutes
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  //Rounding the excedent milliseconds from the first opperation
  seconds = Math.floor(seconds);

  //Add a 0 to required values, like 01d 02h 03m 04s
  if (days < 10) days = "0" + days;
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
