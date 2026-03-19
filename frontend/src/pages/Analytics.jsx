import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import Card from '../components/Card';
import { formatMoney } from '../utils/format';
import { transactionAPI } from '../services/api';

// Цвета для категорий
const COLORS = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#E91E63', '#00BCD4', '#FFC107', '#3F51B5'];

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [topData, setTopData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [catRes, monthRes, topRes] = await Promise.all([
        transactionAPI.getSpendingByCategory(),
        transactionAPI.getSpendingByMonth(),
        transactionAPI.getTopExpenses(),
      ]);
      
      // КОНВЕРТИРУЕМ строки в числа
      const categoryDataParsed = catRes.data.data.map(item => ({
        ...item,
        total: Number(item.total)
      }));
      
      const monthDataParsed = monthRes.data.data.map(item => ({
        ...item,
        total: Number(item.total)
      }));
      
      const topDataParsed = topRes.data.data.map(item => ({
        ...item,
        total: Number(item.total),
        count: Number(item.count)
      }));
      
      setCategoryData(categoryDataParsed);
      setMonthData(monthDataParsed);
      setTopData(topDataParsed);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование месяца для отображения
  const formatMonth = (month) => {
    const [year, mon] = month.split('-');
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return `${months[parseInt(mon) - 1]} ${year}`;
  };

  // Кастомный тултип
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

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка аналитики...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">📊 Аналитика</h1>

      {/* Круговая диаграмма: Расходы по категориям */}
      <Card className="mb-6 p-4">
        <h2 className="font-semibold mb-4 text-center">Расходы по категориям</h2>
        {categoryData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">Нет данных о расходах</p>
            <p className="text-xs text-gray-400">
              Добавьте транзакции с типом "Расход"
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <PieChart width={300} height={320}>
              <Pie
                data={categoryData}
                cx={150}
                cy={120}
                innerRadius={50}
                outerRadius={100}
                paddingAngle={5}
                dataKey="total"
                nameKey="category"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </div>
        )}
      </Card>

      {/* Линейный график: Расходы по месяцам */}
      <Card className="mb-6 p-4">
        <h2 className="font-semibold mb-4 text-center">Расходы по месяцам</h2>
        {monthData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">Нет данных за последние месяцы</p>
            <p className="text-xs text-gray-400">
              Добавьте транзакции за разные месяцы
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <LineChart width={340} height={300} data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonth}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                formatter={(value) => formatMoney(value)}
                labelFormatter={(label) => formatMonth(label)}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </div>
        )}
      </Card>

      {/* Топ-5 категорий */}
      <Card className="mb-6 p-4">
        <h2 className="font-semibold mb-4 text-center">Топ-5 категорий расходов</h2>
        {topData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">Нет данных</p>
            <p className="text-xs text-gray-400">
              Добавьте больше транзакций
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topData.map((item, index) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-gray-400">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.category}</span>
                    <span className="font-bold text-primary">{formatMoney(item.total)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(item.total / topData[0].total) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Сводка */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <h2 className="font-semibold mb-3">📈 Быстрая сводка</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{categoryData.length}</p>
            <p className="text-xs text-gray-500">Категорий</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{monthData.length}</p>
            <p className="text-xs text-gray-500">Месяцев</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {topData.reduce((sum, item) => sum + (item.total || 0), 0) > 0 
                ? formatMoney(topData.reduce((sum, item) => sum + item.total, 0))
                : '0 ₽'}
            </p>
            <p className="text-xs text-gray-500">В топ-5</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {topData.reduce((sum, item) => sum + (item.count || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Транзакций</p>
          </div>
        </div>
      </Card>
    </div>
  );
}