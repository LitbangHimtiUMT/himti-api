export function formatTime(date: Date): string {
    const minutes = new Date(date).getUTCMinutes().toString().padStart(2, '0');
    const hours = new Date(date).getHours().toString().padStart(2, '0');
    const month = new Date(date).toLocaleString('id-ID', { month: 'long' });
    const year = new Date(date).getFullYear();
    const getDate = new Date(date).getDate();
  
    return `${getDate} ${month} ${year}, ${hours}:${minutes}`;
  }