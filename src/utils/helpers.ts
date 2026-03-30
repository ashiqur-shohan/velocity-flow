import dayjs from 'dayjs';

export const formatDate = (date: string) => dayjs(date).format('MMM DD, YYYY');
export const formatDateRange = (start: string, end: string) => `${dayjs(start).format('MMM DD')} – ${dayjs(end).format('MMM DD, YYYY')}`;
export const calcDays = (start: string, end: string) => dayjs(end).diff(dayjs(start), 'day');
export const calcProductivity = (planned: number, actual: number) => planned === 0 ? 0 : Math.round((actual / planned) * 10000) / 100;
