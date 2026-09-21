'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Plus, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories/list');
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName('');
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.categories')}</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.category_name')}
          className="flex-1 px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-500 text-white focus:border-gold-400/50 focus:outline-none transition"
        />
        <button type="submit" className="btn-gold px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('admin.add_category')}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-ink-500 bg-ink-800">
              <div>
                <p className="font-medium text-white">{cat.name}</p>
                <p className="text-xs text-gray-500 font-mono">{cat.slug}</p>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="text-gray-500 hover:text-red-400 transition p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
