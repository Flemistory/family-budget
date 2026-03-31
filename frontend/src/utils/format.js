// Форматирование денег — НАДЁЖНАЯ ВЕРСИЯ
export const formatMoney = (amount) => {
  if (amount === undefined || amount === null) {
    return '0 ₽';
  }
  
  const num = Number(amount);
  if (isNaN(num)) {
    console.error('formatMoney: не число', amount);
    return '0 ₽';
  }
  
  // Форматируем абсолютное значение (без знака)
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
  
  // Добавляем знак вручную
  if (num < 0) {
    return `-${formatted} ₽`;
  }
  return `${formatted} ₽`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(date);
};