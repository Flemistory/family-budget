import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Search, Filter, X, Download } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatMoney } from '../utils/format';
import { transactionAPI, categoryAPI } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    type: 'all',
    category_id: '',
    date_from: '',
    date_to: '',
    search: '',
  });

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error('Load categories error:', err);
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.search) params.search = filters.search;

      const response = await transactionAPI.getAll(params);
      setTransactions(response.data.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = async (id) => {
    if (!confirm('Удалить эту транзакцию?')) return;
    try {
      setDeletingId(id);
      await transactionAPI.delete(id);
      await loadTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setFilters({ type: 'all', category_id: '', date_from: '', date_to: '', search: '' });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.category_id || filters.date_from || filters.date_to || filters.search;

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.search) params.search = filters.search;

      const res = await transactionAPI.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    filters.type === 'all' ? true : c.type === filters.type
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Транзакции</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
            title="Экспорт CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition ${hasActiveFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Фильтры"
          >
            <Filter className="w-5 h-5" />
          </button>
          <Link to="/transactions/new">
            <Button variant="primary" className="p-2 rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              {['all', 'income', 'expense'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilters({ ...filters, type: f })}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.type === f ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Все' : f === 'income' ? 'Доходы' : 'Расходы'}
                </button>
              ))}
            </div>

            <select
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Все категории</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                placeholder="От"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                placeholder="До"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Поиск по комментарию..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-red-500"
              >
                <X className="w-3 h-3" />
                Сбросить фильтры
              </button>
            )}
          </div>
        </Card>
      )}

      {transactions.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">
            {hasActiveFilters ? 'Нет транзакций по выбранным фильтрам' : 'Нет транзакций'}
          </p>
          {!hasActiveFilters && (
            <Link to="/transactions/new" className="mt-4 inline-block">
              <Button variant="primary">Добавить первую</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => (
            <Card key={t.id} className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{t.category_name || 'Без категории'}</p>
                <p className="text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {t.comment && <p className="text-xs text-gray-400">{t.comment}</p>}
              </div>
              <div className="flex items-center gap-2">
                <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                </p>
                <Link
                  to={`/transactions/${t.id}/edit`}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Удалить"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}