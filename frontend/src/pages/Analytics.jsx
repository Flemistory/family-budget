import Card from '../components/Card';
import Button from '../components/Button';
import { formatMoney } from '../utils/format';

const mockAnalytics = {
  categories: [
    { name: 'Продукты', amount: 24500, percent: 35, color: 'bg-green-500' },
    { name: 'Транспорт', amount: 14000, percent: 20, color: 'bg-blue-500' },
    { name: 'Коммунальные услуги', amount: 10500, percent: 15, color: 'bg-orange-500' },
    { name: 'Развлечения', amount: 7000, percent: 10, color: 'bg-purple-500' },
    { name: 'Прочее', amount: 14000, percent: 20, color: 'bg-gray-400' },
  ],
};

export default function Analytics() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <select className="border border-gray-200 rounded-lg p-2">
          <option>Май 2024</option>
          <option>Апрель 2024</option>
        </select>
      </div>

      {/* Круговая диаграмма (упрощённо) */}
      <Card className="mb-6 text-center">
        <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-orange-500 mb-4" />
        <p className="text-sm text-gray-500">Расходы по категориям</p>
      </Card>

      {/* Топ категорий */}
      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Топ категорий</h2>
        <div className="space-y-3">
          {mockAnalytics.categories.map((cat, i) => (
            <div key={cat.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{i + 1}.</span>
                <span>{cat.name}</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatMoney(cat.amount)}</p>
                <p className="text-xs text-gray-500">{cat.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Экспорт */}
      <Button variant="secondary" className="w-full">
        📥 Экспорт в CSV / PDF
      </Button>
    </div>
  );
}