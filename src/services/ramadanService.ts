
import ramadanData from '@/mock/ramadan.json';

export const ramadanService = {
  getChecklist: async () => {
    return ramadanData.checklist;
  },
  getCompletion: (day: number): string[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`ramadan_day_${day}`);
    return data ? JSON.parse(data) : [];
  },
  saveCompletion: (day: number, taskIds: string[]) => {
    localStorage.setItem(`ramadan_day_${day}`, JSON.stringify(taskIds));
  },
  getStreak: () => {
    return 5; // Mock streak
  }
};
