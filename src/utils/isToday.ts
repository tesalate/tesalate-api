import moment from 'moment';

const isToday = (someDate: string) => {
  const today = new Date(moment().utc().local().format('YYYY-MM-DD'));
  const otherDate = new Date(moment(someDate).utc().local().format('YYYY-MM-DD'));
  return (
    otherDate.getDate() == today.getDate() &&
    otherDate.getMonth() == today.getMonth() &&
    otherDate.getFullYear() == today.getFullYear()
  );
};
export default isToday;
