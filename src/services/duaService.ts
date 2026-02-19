
import duaData from '@/mock/duas.json';

export interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ur?: string;
  translation_hi?: string;
}

export interface DuaCollection {
  id: string;
  title: string;
  image: string;
  duaIds: string[];
}

export const duaService = {
  getDuas: async (): Promise<Dua[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(duaData.duas), 500);
    });
  },
  getDuaById: async (id: string): Promise<Dua | undefined> => {
    return duaData.duas.find(d => d.id === id);
  },
  getCollections: async (): Promise<DuaCollection[]> => {
    return duaData.collections;
  },
  getFavoriteDuas: (): string[] => {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem('fav_duas');
    return favorites ? JSON.parse(favorites) : [];
  },
  toggleFavorite: (id: string) => {
    const favorites = duaService.getFavoriteDuas();
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('fav_duas', JSON.stringify(favorites));
    return favorites;
  }
};
