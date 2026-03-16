import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { formatMoney } from '../utils/format';
import { transactionAPI } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем транзакции и статистику
      const [transactionsRes, statsRes] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getStats(),
      ]);

      const transactions = transactionsRes.data.data;
      const stats = statsRes.data.data;

      setData({
        balance: stats.balance,
        income: stats.totalIncome,
        expenses: stats.totalExpense,
        transactions: transactions.slice(0, 5), // Последние 5
        goals: [], // Пока заглушка
        upcomingPayments: [], // Пока заглушка
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
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
        <div className="text-danger">{error}</div>
        <Button onClick={loadDashboard} className="mt-4">
          Повторить
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Баланс */}
      <div className="text-center mb-6">
        <h1 className={`text-4xl font-bold ${data.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
          {formatMoney(data.balance)}
        </h1>
        <p className="text-gray-500 mt-1">Общий баланс</p>
      </div>

      {/* Доходы / Расходы */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Доходы</p>
          <p className="text-lg font-bold text-green-600">{formatMoney(data.income)}</p>
        </Card>
        <Card className="text-center">
          <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Расходы</p>
          <p className="text-lg font-bold text-red-600">{formatMoney(data.expenses)}</p>
        </Card>
      </div>

      {/* Последние транзакции */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Последние транзакции</h2>
          <Link to="/transactions">
            <Button variant="outline" className="text-sm py-1">
              Все
            </Button>
          </Link>
        </div>
        {data.transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Нет транзакций</p>
        ) : (
          <div className="space-y-3">
            {data.transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">{t.category_name || 'Без категории'}</p>
                    <p className="text-xs text-gray-500">{t.date}</p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Цели (пока заглушка) */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Цели</h2>
          <Link to="/goals">
            <Button variant="outline" className="text-sm py-1">
              Все цели
            </Button>
          </Link>
        </div>
        <p className="text-gray-500 text-center py-4">
          Скоро будет... 🎯
        </p>
      </Card>

      {/* Кнопка добавить транзакцию */}
      <Link to="/transactions/new">
        <Button className="w-full py-4 text-lg font-semibold" variant="primary">
          + Добавить транзакцию
        </Button>
      </Link>
    </div>
  );
}