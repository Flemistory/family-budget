import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Eye, Crown, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { familyAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const roleLabels = {
  admin: { label: 'Админ', icon: Crown, color: 'text-yellow-600' },
  member: { label: 'Участник', icon: Shield, color: 'text-blue-600' },
  viewer: { label: 'Наблюдатель', icon: Eye, color: 'text-gray-500' },
};

export default function Family() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await familyAPI.getMembers();
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Load members error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await familyAPI.inviteMember(email, role);
      if (res.data.success) {
        setSuccess(`${res.data.data.name} добавлен в семью`);
        setEmail('');
        setShowInvite(false);
        loadMembers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка приглашения');
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!confirm(`Удалить ${memberName} из семьи?`)) return;
    try {
      await familyAPI.removeMember(memberId);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">Участники семьи</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1 text-blue-600 text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Пригласить
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      {showInvite && isAdmin && (
        <Card className="mb-6">
          <form onSubmit={handleInvite} className="space-y-3">
            <h3 className="font-semibold text-sm">Пригласить участника</h3>
            <p className="text-xs text-gray-500">
              Пользователь должен быть зарегистрирован в приложении
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
            >
              <option value="member">Участник</option>
              <option value="viewer">Наблюдатель</option>
              <option value="admin">Админ</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 text-sm py-2">
                Добавить
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-sm py-2"
                onClick={() => { setShowInvite(false); setError(''); }}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {members.map(member => {
          const roleInfo = roleLabels[member.role] || roleLabels.member;
          const RoleIcon = roleInfo.icon;
          const isMe = member.id === user?.id;

          return (
            <Card key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium">
                    {member.name} {isMe && <span className="text-xs text-gray-400">(Вы)</span>}
                  </p>
                  <div className={`flex items-center gap-1 text-xs ${roleInfo.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleInfo.label}
                  </div>
                </div>
              </div>
              {isAdmin && !isMe && (
                <button
                  onClick={() => handleRemove(member.id, member.name)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                  title="Удалить из семьи"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Нет участников</p>
        </div>
      )}
    </div>
  );
}