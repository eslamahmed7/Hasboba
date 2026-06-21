import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAdd: () => void;
}

export function SearchBar({ onSearch, onAdd }: SearchBarProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="px-6 flex flex-col gap-4 mt-4">
      <h3 className="text-xl font-bold text-white mb-2">{t('search.title')}</h3>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          className={`relative rounded-full bg-glass-dark border border-white/10 transition-all duration-300 ${
            isFocused ? 'ring-2 ring-blue-500/50' : ''
          }`}
        >
          <Search
            size={20}
            className={`absolute ${t('search.title') === 'البحث الذكي' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('search.placeholder')}
            className={`w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none ${
              t('search.title') === 'البحث الذكي' ? 'pr-12 pl-4' : 'pl-12 pr-4'
            }`}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className={`absolute ${t('search.title') === 'البحث الذكي' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors`}
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={onAdd}
        className="flex items-center justify-center gap-2 py-3 rounded-full bg-glass-dark border border-white/5 hover:bg-white/5 transition-colors text-gray-300"
      >
        <span>{t('quick.add')}</span>
      </motion.button>
    </div>
  );
}
