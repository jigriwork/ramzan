import { Firestore, collection, doc, writeBatch, getDocs, query, limit } from 'firebase/firestore';
import { QURAN_SURAHS, QURAN_AYAH_MOCK, DUAS } from './seed';
import duaMock from '@/mock/duas.json';

export async function seedDatabase(db: Firestore) {
  // Only seed if empty to prevent duplicates/costs
  const surahCheck = await getDocs(query(collection(db, 'quran_surahs'), limit(1)));
  if (!surahCheck.empty) {
    console.log('Database already has data.');
    return false;
  }

  const batch = writeBatch(db);

  // Seed Surahs
  QURAN_SURAHS.forEach(surah => {
    const ref = doc(db, 'quran_surahs', surah.id);
    batch.set(ref, surah);
  });

  // Seed Ayahs
  QURAN_AYAH_MOCK.forEach(ayah => {
    const id = `${ayah.surahId}_${ayah.ayahNo}`;
    const ref = doc(db, 'quran_ayahs', id);
    batch.set(ref, ayah);
  });

  // Seed Duas
  DUAS.forEach(dua => {
    const ref = doc(db, 'duas', dua.id);
    batch.set(ref, dua);
  });

  // Seed Dua Collections
  (duaMock.collections || []).forEach((collectionItem) => {
    const ref = doc(db, 'dua_collections', collectionItem.id);
    batch.set(ref, collectionItem);
  });

  await batch.commit();
  return true;
}
