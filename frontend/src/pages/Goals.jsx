import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Target } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { formatMoney } from '../utils/format';
import { goalAPI } from '../services/api';

// Иконки для целей
const goalIcons = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎮', '🎁', '💍', '🎓'];

// Цвета для целей
const goalColors = [
  '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#E91E63',
  '#00BCD4', '#FFC107', '#3F51B5', '#009688', '#795548'
];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Форма
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4CAF50');
  const [selectedIcon, setSelectedIcon] = useState('🎯');

  // Загрузка целей
  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await goalAPI.getAll();
      setGoals(response.data.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Сброс формы
  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setSelectedColor('#4CAF50');
    setSelectedIcon('🎯');
    setEditingGoal(null);
    setShowForm(false);
  };

  // Открытие формы для редактирования
  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setDeadline(goal.deadline?.split('T')[0] || '');
    setSelectedColor(goal.color || '#4CAF50');
    setSelectedIcon(goal.icon || '🎯');
    setShowForm(true);
  };

  // Сохранение цели
  const handleSave = async () => {
    if (!name || !targetAmount) {
      alert('Введите название и целевую сумму!');
      return;
    }

    try {
      const goalData = {
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        deadline: deadline || null,
        color: selectedColor,
        icon: selectedIcon,
      };

      if (editingGoal) {
        // Обновление существующей цели
        await goalAPI.update(editingGoal.id, goalData);
        alert('✅ Цель обновлена!');
      } else {
        // Создание новой цели
        await goalAPI.create(goalData);
        alert('✅ Цель создана!');
      }
      
      resetForm();
      await loadGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      alert('❌ Ошибка: ' + err.message);
    }
  };

  // Удаление цели
  const handleDelete = async (id) => {
    if (!confirm('Удалить эту цель?')) return;
    
    try {
      await goalAPI.delete(id);
      await loadGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      alert('❌ Ошибка при удалении');
    }
  };

  // Пополнение цели
  const handleContribute = async (goal) => {
    const amount = prompt(`Пополнить цель "${goal.name}":`, '1000');
    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      await goalAPI.contribute(goal.id, parseFloat(amount));
      alert('✅ Цель пополнена!');
      await loadGoals();
    } catch (err) {
      console.error('Error contributing:', err);
      alert('❌ Ошибка при пополнении');
    }
  };

  // Расчет прогресса
  const getProgress = (goal) => {
    const percent = (goal.current_amount / goal.target_amount) * 100;
    return Math.min(Math.round(percent), 100);
  };

  if (loading && goals.length === 0) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Цели</h1>
        <Button 
          variant="primary" 
          className="p-2 rounded-full"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Форма создания/редактирования */}
      {showForm && (
        <Card className="mb-6 p-4">
          <h2 className="font-semibold mb-4">
            {editingGoal ? '✏️ Редактирование цели' : '🎯 Новая цель'}
          </h2>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название цели"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Целевая сумма"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <input
                type="number"
                placeholder="Уже накоплено"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            
            {/* Выбор иконки */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Иконка</p>
              <div className="flex gap-2 flex-wrap">
                {goalIcons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      selectedIcon === icon ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Выбор цвета */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Цвет</p>
              <div className="flex gap-2 flex-wrap">
                {goalColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Кнопки */}
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={handleSave}>
                💾 Сохранить
              </Button>
              <Button variant="outline" onClick={resetForm}>
                ✕ Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Список целей */}
      {goals.length === 0 ? (
        <Card className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Нет целей</p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Создать первую цель
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = getProgress(goal);
            const isComplete = progress >= 100;
            
            return (
              <Card key={goal.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.icon || '🎯'}</span>
                    <div>
                      <h3 className="font-semibold">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-gray-500">
                          До {new Date(goal.deadline).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Прогресс-бар */}
                <ProgressBar 
                  value={progress} 
                  color={goal.color || '#4CAF50'}
                  className="mb-2"
                />
                
                {/* Суммы */}
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">
                    {formatMoney(goal.current_amount)} из {formatMoney(goal.target_amount)}
                  </span>
                  <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-primary'}`}>
                    {progress}%
                  </span>
                </div>
                
                {/* Кнопка пополнения */}
                {!isComplete && (
                  <Button 
                    variant="outline" 
                    className="w-full py-2 text-sm"
                    onClick={() => handleContribute(goal)}
                  >
                    💰 Пополнить
                  </Button>
                )}
                
                {isComplete && (
                  <div className="text-center text-green-600 font-medium text-sm">
                    🎉 Цель достигнута!
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}