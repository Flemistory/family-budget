import { Plus } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { formatMoney } from '../utils/format';

const mockGoals = [
  { id: 1, name: 'Отпуск', current: 45000, target: 100000, progress: 45, deadline: 'Июль 2024' },
  { id: 2, name: 'Подушка безопасности', current: 140000, target: 200000, progress: 70, deadline: null },
  { id: 3, name: 'Ремонт', current: 75000, target: 300000, progress: 25, deadline: 'Декабрь 2024' },
];

export default function Goals() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Финансовые цели</h1>
        <Button variant="secondary" className="p-2 rounded-full">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {mockGoals.map(goal => (
          <Card key={goal.id}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{goal.name}</h3>
              {goal.deadline && <span className="text-xs text-gray-500">{goal.deadline}</span>}
            </div>
            <ProgressBar 
              progress={goal.progress} 
              color={goal.progress >= 70 ? 'bg-green-500' : goal.progress >= 40 ? 'bg-blue-500' : 'bg-orange-500'} 
            />
            <div className="flex justify-between items-center mt-3">
              <div>
                <p className="font-bold">{formatMoney(goal.target)}</p>
                <p className="text-sm text-gray-500">{formatMoney(goal.current)}</p>
              </div>
              <Button variant="secondary" className="text-sm py-1">Пополнить</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}