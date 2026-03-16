import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { formatMoney } from '../utils/format';

// Моковые данные (временно, вместо API)
const mockData = {
  balance: 125400,
  income: 85000,
  expenses: 62300,
  goals: [
    { id: 1, name: 'Отпуск', current: 45000, target: 100000, progress: 45 },
    { id: 2, name: 'Подушка безопасности', current: 140000, target: 200000, progress: 70 },
  ],
  upcomingPayments: [
    { id: 1, name: 'Аренда', amount: 25000, date: '2024-06-01' },
    { id: 2, name: 'Интернет', amount: 500, date: '2024-06-05' },
    { id: 3, name: 'Кредит', amount: 15000, date: '2024-06-10' },
  ],
};

export default function Dashboard() {
  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Баланс */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-primary">{formatMoney(mockData.balance)}</h1>
        <p className="text-gray-500 mt-1">Общий баланс</p>
      </div>

      {/* Доходы / Расходы */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Доходы за май</p>
          <p className="text-lg font-bold">{formatMoney(mockData.income)}</p>
        </Card>
        <Card className="text-center">
          <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Расходы за май</p>
          <p className="text-lg font-bold">{formatMoney(mockData.expenses)}</p>
        </Card>
      </div>

      {/* Ближайшие платежи */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Ближайшие платежи</h2>
        <div className="space-y-3">
          {mockData.upcomingPayments.map(payment => (
            <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span>{payment.name}</span>
              </div>
              <span className="font-medium">{formatMoney(payment.amount)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Цели */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Цели</h2>
          <Button variant="outline" className="text-sm py-1">Все цели</Button>
        </div>
        <div className="space-y-4">
          {mockData.goals.map(goal => (
            <div key={goal.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{goal.name}</span>
                <span className="text-sm text-primary">{goal.progress}%</span>
              </div>
              <ProgressBar progress={goal.progress} />
              <p className="text-xs text-gray-500 mt-1">
                {formatMoney(goal.current)} из {formatMoney(goal.target)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}