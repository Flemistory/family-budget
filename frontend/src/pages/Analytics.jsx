import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../components/Card';
import { formatMoney } from '../utils/format';
import { transactionAPI } from '../services/api';

const COLORS = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#E91E63', '#00BCD4', '#FFC107', '#3F51B5'];

export default function Analytics() {
  const [tab, setTab] = useState('expense');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expenseMonths, setExpenseMonths] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [incomeMonths, setIncomeMonths] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [catRes, monthRes, topRes, incCatRes, incMonthRes, compRes] = await Promise.all([
        transactionAPI.getSpendingByCategory(),
        transactionAPI.getSpendingByMonth(),
        transactionAPI.getTopExpenses(),
        transactionAPI.getIncomeByCategory(),
        transactionAPI.getIncomeByMonth(),
        transactionAPI.getMonthlyComparison(),
      ]);

      setExpenseCategories(catRes.data.data.map(i => ({ ...i, total: Number(i.total) })));
      setExpenseMonths(monthRes.data.data.map(i => ({ ...i, total: Number(i.total) })));
      setTopExpenses(topRes.data.data.map(i => ({ ...i, total: Number(i.total), count: Number(i.count) })));
      setIncomeCategories(incCatRes.data.data.map(i => ({ ...i, total: Number(i.total) })));
      setIncomeMonths(incMonthRes.data.data.map(i => ({ ...i, total: Number(i.total) })));
      setComparison(compRes.data.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month) => {
    const [year, mon] = month.split('-');
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return `${months[parseInt(mon) - 1]} ${year}`;
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-primary font-bold">{formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const categoryData = tab === 'expense' ? expenseCategories : incomeCategories;
  const monthData = tab === 'expense' ? expenseMonths : incomeMonths;
  const chartColor = tab === 'expense' ? '#E53935' : '#4CAF50';

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка аналитики...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-4">Аналитика</h1>

      {comparison && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Доходы</span>
            </div>
            <p className="font-bold text-green-600">{formatMoney(comparison.income.current)}</p>
            <p className={`text-xs ${comparison.income.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {comparison.income.change >= 0 ? '+' : ''}{comparison.income.change}% vs прошлый месяц
            </p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Расходы</span>
            </div>
            <p className="font-bold text-red-600">{formatMoney(comparison.expense.current)}</p>
            <p className={`text-xs ${comparison.expense.change <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {comparison.expense.change >= 0 ? '+' : ''}{comparison.expense.change}% vs прошлый месяц
            </p>
          </Card>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('expense')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >Расходы</button>
        <button
          onClick={() => setTab('income')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >Доходы</button>
      </div>

      <Card className="mb-4 p-4">
        <h2 className="font-semibold mb-3 text-center">
          {tab === 'expense' ? 'Расходы' : 'Доходы'} по категориям
        </h2>
        {categoryData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Нет данных</div>
        ) : (
          <div className="flex flex-col items-center">
            <PieChart width={300} height={300}>
              <Pie data={categoryData} cx={150} cy={120} innerRadius={45} outerRadius={95}
                paddingAngle={5} dataKey="total" nameKey="category">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend verticalAlign="bottom" height={36}
                formatter={(value) => <span className="text-xs">{value}</span>} />
            </PieChart>
          </div>
        )}
      </Card>

      <Card className="mb-4 p-4">
        <h2 className="font-semibold mb-3 text-center">
          {tab === 'expense' ? 'Расходы' : 'Доходы'} по месяцам
        </h2>
        {monthData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Нет данных</div>
        ) : (
          <div className="flex justify-center">
            <LineChart width={340} height={280} data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatMoney(v)} labelFormatter={formatMonth} />
              <Line type="monotone" dataKey="total" stroke={chartColor} strokeWidth={2}
                dot={{ fill: chartColor, strokeWidth: 2, r: 4 }} />
            </LineChart>
          </div>
        )}
      </Card>

      {tab === 'expense' && (
        <Card className="mb-4 p-4">
          <h2 className="font-semibold mb-3 text-center">Топ-5 категорий</h2>
          {topExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">Нет данных</div>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((item, i) => (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-gray-400">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className="font-bold" style={{ color: COLORS[i] }}>{formatMoney(item.total)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(item.total / topExpenses[0].total) * 100}%`, backgroundColor: COLORS[i] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}