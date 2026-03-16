import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatMoney, formatDate } from '../utils/format';

const mockTransactions = [
  { id: 1, type: 'expense', category: 'Продукты', amount: 5200, date: '2024-05-12', comment: 'Пятёрочка' },
  { id: 2, type: 'income', category: 'Зарплата', amount: 50000, date: '2024-05-10', comment: 'Аванс' },
  { id: 3, type: 'expense', category: 'Транспорт', amount: 1500, date: '2024-05-09', comment: 'Бензин' },
  { id: 4, type: 'expense', category: 'Коммуналка', amount: 8500, date: '2024-05-05', comment: 'Квартплата' },
];

export default function Transactions() {
  const [filter, setFilter] = useState('all');

  const filtered = mockTransactions.filter(t => filter === 'all' || t.type === filter);

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Транзакции</h1>
        <Link to="/transactions/new">
          <Button variant="primary" className="p-2 rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-4">
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'income' ? 'Доходы' : 'Расходы'}
          </button>
        ))}
      </div>

      {/* Список */}
      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{t.category}</p>
              <p className="text-sm text-gray-500">{formatDate(t.date)}</p>
              {t.comment && <p className="text-xs text-gray-400">{t.comment}</p>}
            </div>
            <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
              {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}