import { Home, Wallet, Target, PieChart, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  if (!user || ['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Главная</span>
        </Link>
        
        <Link to="/transactions" className={`flex flex-col items-center p-2 ${isActive('/transactions') ? 'text-primary' : 'text-gray-500'}`}>
          <Wallet className="w-5 h-5" />
          <span className="text-xs mt-1">Транзакции</span>
        </Link>
        
        <Link to="/goals" className={`flex flex-col items-center p-2 ${isActive('/goals') ? 'text-primary' : 'text-gray-500'}`}>
          <Target className="w-5 h-5" />
          <span className="text-xs mt-1">Цели</span>
        </Link>
        
        <Link to="/analytics" className={`flex flex-col items-center p-2 ${isActive('/analytics') ? 'text-primary' : 'text-gray-500'}`}>
          <PieChart className="w-5 h-5" />
          <span className="text-xs mt-1">Аналитика</span>
        </Link>

        <Link to="/family" className={`flex flex-col items-center p-2 ${isActive('/family') ? 'text-primary' : 'text-gray-500'}`}>
          <Users className="w-5 h-5" />
          <span className="text-xs mt-1">Семья</span>
        </Link>
      </div>
    </nav>
  );
}