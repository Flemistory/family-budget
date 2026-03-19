// Форматирование денег
export const formatMoney = (amount) => {
  // Проверяем, что это число
  const num = Number(amount);
  
  if (isNaN(num)) {
    console.error('formatMoney: не число', amount);
    return '0 ₽';
  }
  
  // Форматируем с разделителями тысяч
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Форматирование даты
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Форматирование короткой даты
export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};