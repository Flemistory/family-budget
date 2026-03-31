import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatMoney } from '../utils/format';
import { transactionAPI, categoryAPI } from '../services/api';

const categoryIcons = {
  'Продукты': '🛒', 'Транспорт': '🚌', 'Коммуналка': '💧', 'Развлечения': '🎬',
  'Здоровье': '💊', 'Одежда': '👕', 'Кафе': '☕', 'Зарплата': '💼',
  'Фриланс': '💻', 'Перевод': '💳', 'Подарок': '🎁', 'Кэшбэк': '💰',
  'Инвестиции': '📈', 'Другое': '⋯',
};

const categoryColors = [
  'bg-green-100', 'bg-blue-100', 'bg-orange-100', 'bg-purple-100',
  'bg-red-100', 'bg-pink-100', 'bg-yellow-100', 'bg-indigo-100', 'bg-gray-100',
];

export default function NewTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll(type);
      if (res.data.success) {
        setCategories(res.data.data);
        setSelectedCategory(null);
      }
    } catch (err) {
      console.error('Load categories error:', err);
    }
  };

  const handleNumberClick = (num) => {
    if (amount.length < 10) setAmount(amount + num);
  };

  const handleBackspace = () => setAmount(amount.slice(0, -1));

  const handleClear = () => {
    setAmount('');
    setSelectedCategory(null);
  };

  const handleSave = async () => {
    if (!amount || !selectedCategory) {
      alert('Введите сумму и выберите категорию!');
      return;
    }
    try {
      setLoading(true);
      await transactionAPI.create({
        category_id: selectedCategory.id,
        amount: parseFloat(amount),
        type,
        date,
        comment,
      });
      window.location.href = '/transactions';
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="px-3 py-1">← Назад</Button>
        <h1 className="text-xl font-bold">Новая транзакция</h1>
        <div className="w-16"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setType('expense')}
          className={`py-4 rounded-xl font-semibold text-lg transition-all ${
            type === 'expense' ? 'bg-danger text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600'
          }`}
        >
          Расход
        </button>
        <button
          onClick={() => setType('income')}
          className={`py-4 rounded-xl font-semibold text-lg transition-all ${
            type === 'income' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600'
          }`}
        >
          Доход
        </button>
      </div>

      <Card className="mb-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Сумма</p>
        <div className={`text-5xl font-bold mb-2 min-h-[60px] ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {amount ? formatMoney(amount) : <span className="text-gray-300">0 ₽</span>}
        </div>
        {amount && <button onClick={handleClear} className="text-sm text-danger underline">Очистить</button>}
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">{type === 'expense' ? 'Категория расхода' : 'Категория дохода'}</h2>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedCategory?.id === cat.id
                  ? 'bg-primary text-white shadow-md scale-105'
                  : (categoryColors[idx % categoryColors.length]) + ' hover:opacity-80'
              }`}
            >
              <span className="text-2xl">{categoryIcons[cat.name] || '📁'}</span>
              <p className="text-xs mt-1">{cat.name}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </Card>

      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
        <div className="relative">
          <input
            type="text" value={comment} onChange={e => setComment(e.target.value)}
            placeholder={type === 'expense' ? 'Например: Пятёрочка' : 'Например: Аванс'}
            className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-12"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => handleNumberClick(num.toString())}
              className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-medium transition-colors">{num}</button>
          ))}
          <button onClick={handleBackspace}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-xl font-medium transition-colors">←</button>
          <button onClick={() => handleNumberClick('0')}
            className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-medium transition-colors">0</button>
          <button onClick={() => handleNumberClick('00')}
            className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-medium transition-colors">00</button>
        </div>
      </Card>

      <Button
        variant={type === 'expense' ? 'danger' : 'primary'}
        className="w-full py-4 text-lg font-semibold"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Сохранение...' : type === 'expense' ? '💸 Добавить расход' : '💰 Добавить доход'}
      </Button>
    </div>
  );
}