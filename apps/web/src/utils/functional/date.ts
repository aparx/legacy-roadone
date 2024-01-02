import dayjs from 'dayjs';

export const toDatetimeLocal = (date: Date) =>
  dayjs(date).format('YYYY-MM-DDTHH:mm:ss');