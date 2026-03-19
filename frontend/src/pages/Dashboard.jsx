import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { formatMoney } from '../utils/format';
import { transactionAPI, goalAPI } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      const [transactionsRes, statsRes, goalsRes] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getStats(),
        goalAPI.getAll(),
      ]);

      const transactions = transactionsRes.data.data;
      const stats = statsRes.data.data;
      const goalsData = goalsRes.data.data;

      setData({
        balance: stats.freeBalance,
        totalBalance: stats.totalBalance,
        allocatedToGoals: stats.allocatedToGoals,
        income: stats.totalIncome,
        expenses: stats.totalExpense,
        transactions: transactions.slice(0, 5),
      });
      
      setGoals(goalsData.slice(0, 3));
      
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Определяем цвет баланса в зависимости от состояния
  const getBalanceColor = () => {
    if (!data) return 'text-gray-800';
    if (data.freeBalance < 0) return 'text-danger';
    if (data.freeBalance < data.totalBalance * 0.2 && data.totalBalance > 0) return 'text-orange-500';
    return 'text-primary';
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-danger">Ошибка загрузки</div>
        <Button onClick={loadDashboard} className="mt-4">
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Баланс с визуальным разделением */}
      <div className="text-center mb-6">
        {/* Свободный баланс (основной) */}
        <h1 className={`text-4xl font-bold ${getBalanceColor()}`}>
          {formatMoney(data.freeBalance)}
        </h1>
        <p className="text-gray-500 mt-1">Свободные средства</p>
        
        {/* Детализация */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Всего заработано:</span>
              <span className="font-medium text-green-600">{formatMoney(data.totalBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Отложено на цели:</span>
              <span className="font-medium text-purple-600">-{formatMoney(data.allocatedToGoals)}</span>
            </div>
            <div className="border-t border-gray-300 pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Доступно:</span>
                <span className={getBalanceColor()}>{formatMoney(data.freeBalance)}</span>
              </div>
            </div>
          </div>
        </div>
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
                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
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

      {/* Цели */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Цели</h2>
          <Link to="/goals">
            <Button variant="outline" className="text-sm py-1">
              Все цели
            </Button>
          </Link>
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-4">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Нет целей</p>
            <Link to="/goals">
              <Button variant="primary" className="mt-3 text-sm py-2">
                + Создать цель
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
              
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.icon || '🎯'}</span>
                      <span className="font-medium text-sm">{goal.name}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: goal.color || '#4CAF50' }}>
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={progress} 
                    color={goal.color || '#4CAF50'}
                    className="mb-1"
                    height="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    {formatMoney(goal.current_amount)} из {formatMoney(goal.target_amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
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