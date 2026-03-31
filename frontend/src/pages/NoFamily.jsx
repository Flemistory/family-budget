import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { familyAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function NoFamily() {
  const [showCreate, setShowCreate] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await familyAPI.createFamily(familyName.trim());
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания семьи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать!</h1>
          <p className="text-gray-500 mt-2">
            Создайте свою семью или дождитесь приглашения от администратора
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {!showCreate ? (
          <div className="space-y-3">
            <Card className="p-4">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Создать семью</p>
                    <p className="text-xs text-gray-500">Вы станете администратором</p>
                  </div>
                </div>
              </button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Жду приглашения</p>
                  <p className="text-xs text-gray-500">Админ семьи добавит вас по email</p>
                </div>
              </div>
            </Card>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-sm text-gray-400 hover:text-gray-600 mt-4"
            >
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          <Card className="p-4 text-left">
            <form onSubmit={handleCreate} className="space-y-3">
              <h3 className="font-semibold">Название семьи</h3>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Семья Ивановых"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Создание...' : 'Создать'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCreate(false); setError(''); }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}