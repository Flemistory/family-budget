import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatMoney } from '../utils/format';
import { transactionAPI } from '../services/api';

// Категории для РАСХОДОВ
const expenseCategories = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Продукты', icon: '🛒', color: 'bg-green-100' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Транспорт', icon: '🚌', color: 'bg-blue-100' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Коммуналка', icon: '💧', color: 'bg-orange-100' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Развлечения', icon: '🎬', color: 'bg-purple-100' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Здоровье', icon: '💊', color: 'bg-red-100' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Одежда', icon: '👕', color: 'bg-pink-100' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Кафе', icon: '☕', color: 'bg-yellow-100' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Другое', icon: '⋯', color: 'bg-gray-100' },
];

// Категории для ДОХОДОВ
const incomeCategories = [
  { id: '00000000-0000-0000-0000-000000000005', name: 'Зарплата', icon: '💼', color: 'bg-green-100' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Фриланс', icon: '💻', color: 'bg-blue-100' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Перевод', icon: '💳', color: 'bg-purple-100' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Подарок', icon: '🎁', color: 'bg-pink-100' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Кэшбэк', icon: '💰', color: 'bg-yellow-100' },
  { id: '00000000-0000-0000-0000-000000000010', name: 'Инвестиции', icon: '📈', color: 'bg-indigo-100' },
  { id: '00000000-0000-0000-0000-000000000011', name: 'Другое', icon: '⋯', color: 'bg-gray-100' },
];

export default function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams(); // Получаем ID из URL
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Выбираем категории в зависимости от типа транзакции
  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  // Загружаем данные транзакции
  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getById(id);
      const t = response.data.data;
      
      setType(t.type);
      setAmount(t.amount.toString());
      setDate(t.date);
      setComment(t.comment || '');
      
      // Находим категорию по ID
      const allCategories = [...expenseCategories, ...incomeCategories];
      const category = allCategories.find(c => c.id === t.category_id);
      if (category) {
        setSelectedCategory(category);
      }
    } catch (err) {
      console.error('Failed to load transaction:', err);
      setError('Не удалось загрузить транзакцию');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (num) => {
    if (amount.length < 10) {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleClear = () => {
    setAmount('');
  };

  const handleSave = async () => {
    if (!amount || !selectedCategory) {
      alert('Введите сумму и выберите категорию!');
      return;
    }

    try {
      setSaving(true);
      
      const transaction = {
        category_id: selectedCategory.id,
        amount: parseFloat(amount),
        type,
        date,
        comment,
      };

      await transactionAPI.update(id, transaction);
      
      alert('✅ Транзакция обновлена!');
      window.location.href = '/transactions';
      
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('❌ Ошибка при сохранении: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-danger mb-4">{error}</div>
        <Button onClick={() => navigate(-1)}>Назад</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-8">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="px-3 py-1">
          ← Назад
        </Button>
        <h1 className="text-xl font-bold">Редактирование</h1>
        <div className="w-16"></div>
      </div>

      {/* Тип транзакции */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            setType('expense');
            setSelectedCategory(null);
          }}
          className={`py-4 rounded-xl font-semibold text-lg transition-all ${
            type === 'expense'
              ? 'bg-danger text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Расход
        </button>
        <button
          onClick={() => {
            setType('income');
            setSelectedCategory(null);
          }}
          className={`py-4 rounded-xl font-semibold text-lg transition-all ${
            type === 'income'
              ? 'bg-primary text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          Доход
        </button>
      </div>

      {/* Сумма */}
      <Card className="mb-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Сумма</p>
        <div className={`text-5xl font-bold mb-2 min-h-[60px] ${
          type === 'income' ? 'text-green-600' : 'text-red-600'
        }`}>
          {amount ? formatMoney(amount) : <span className="text-gray-300">0 ₽</span>}
        </div>
        {amount && (
          <button onClick={handleClear} className="text-sm text-danger underline">
            Очистить
          </button>
        )}
      </Card>

      {/* Категории */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-3">
          {type === 'expense' ? 'Категория расхода' : 'Категория дохода'}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedCategory?.id === cat.id
                  ? 'bg-primary text-white shadow-md scale-105'
                  : cat.color + ' hover:opacity-80'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <p className="text-xs mt-1">{cat.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Дата */}
      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </Card>

      {/* Комментарий */}
      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
        <div className="relative">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={type === 'expense' ? 'Например: Пятёрочка' : 'Например: Аванс'}
            className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-12"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </Card>

      {/* Цифровая клавиатура */}
      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-medium transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-xl font-medium transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-medium transition-colors"
          >
            0
          </button>
          <button
            onClick={() => handleNumberClick('00')}
            className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-medium transition-colors"
          >
            00
          </button>
        </div>
      </Card>

      {/* Кнопка сохранения */}
      <Button
        variant={type === 'expense' ? 'danger' : 'primary'}
        className="w-full py-4 text-lg font-semibold"
        onClick={handleSave}
        disabled={saving || loading}
      >
        {saving ? 'Сохранение...' : '💾 Сохранить изменения'}
      </Button>
    </div>
  );
}