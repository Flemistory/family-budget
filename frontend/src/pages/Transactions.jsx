import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatMoney } from '../utils/format';
import { transactionAPI } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      setTransactions(response.data.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Подтверждение перед удалением
    if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      return;
    }

    try {
      setDeletingId(id);
      await transactionAPI.delete(id);
      
      // Обновляем список после удаления
      await loadTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('❌ Ошибка при удалении: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Всегда загружаем при открытии страницы
  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

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
      {filtered.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">Нет транзакций</p>
          <Link to="/transactions/new" className="mt-4 inline-block">
            <Button variant="primary">Добавить первую</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <Card key={t.id} className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{t.category_name || 'Без категории'}</p>
                <p className="text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {t.comment && <p className="text-xs text-gray-400">{t.comment}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                </p>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Удалить транзакцию"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}