import { Home, Wallet, Target, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Главная</span>
        </Link>
        
        <Link to="/transactions" className={`flex flex-col items-center p-2 ${isActive('/transactions') ? 'text-primary' : 'text-gray-500'}`}>
          <Wallet className="w-6 h-6" />
          <span className="text-xs mt-1">Транзакции</span>
        </Link>
        
        <Link to="/goals" className={`flex flex-col items-center p-2 ${isActive('/goals') ? 'text-primary' : 'text-gray-500'}`}>
          <Target className="w-6 h-6" />
          <span className="text-xs mt-1">Цели</span>
        </Link>
        
        <Link to="/analytics" className={`flex flex-col items-center p-2 ${isActive('/analytics') ? 'text-primary' : 'text-gray-500'}`}>
          <PieChart className="w-6 h-6" />
          <span className="text-xs mt-1">Аналитика</span>
        </Link>
      </div>
    </nav>
  );
}