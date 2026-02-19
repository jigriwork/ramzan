
import storiesData from '@/mock/kids_stories.json';
import quizData from '@/mock/kids_quiz.json';

export const kidsService = {
  getStories: async () => {
    return storiesData.stories;
  },
  getStoryById: async (id: string) => {
    return storiesData.stories.find(s => s.id === id);
  },
  getQuizzes: async () => {
    return quizData.quizzes;
  },
  saveScore: (quizId: string, score: number) => {
    localStorage.setItem(`quiz_score_${quizId}`, String(score));
  }
};
