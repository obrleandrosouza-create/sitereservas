import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

export const TZ = 'America/Sao_Paulo';

export function slotsForDate(dateISO: string) {
  // 19:00 até 22:30 de 30 em 30 min
  const times = ['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'];
  return times.map((t) => ({
    label: t,
    startUTC: zonedTimeToUtc(`${dateISO}T${t}:00`, TZ),
    endUTC: zonedTimeToUtc(`${dateISO}T${addMinutesStr(t,150)}:00`, TZ)
  }));
}

function addMinutesStr(hhmm: string, minutes: number) {
  const [h,m] = hhmm.split(':').map(Number);
  const total = h*60 + m + minutes;
  const H = Math.floor(total/60);
  const M = total % 60;
  return `${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}`;
}

export function formatBR(d: Date) {
  return format(utcToZonedTime(d, TZ), 'dd/MM/yyyy HH:mm', { timeZone: TZ });
}
