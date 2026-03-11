import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service-account.json');

async function main() {
    console.log('🚀 Starting Firestore Database Seeding...');

    // 1. Verify Service Account
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        console.error('❌ ERROR: service-account.json not found in the root directory.');
        console.log('\nTo get this file:');
        console.log('1. Go to Firebase Console -> Project Settings -> Service Accounts');
        console.log('2. Click "Generate new private key"');
        console.log('3. Save the downloaded file as "service-account.json" in this folder.');
        console.log('4. Run this script again.');
        process.exit(1);
    }

    // 2. Initialize Firebase Admin
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
        if (!getApps().length) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
        console.log('✅ Firebase Admin Initialized.');
    } catch (error: any) {
        console.error('❌ ERROR initializing Firebase Admin:', error.message);
        process.exit(1);
    }

    const db = getFirestore();

    // --- QURAN DATA ---
    console.log('⏳ Fetching Arabic Quran data from api.alquran.cloud...');
    try {
        const arRes = await fetch('http://api.alquran.cloud/v1/quran/quran-uthmani');
        const arData = await arRes.json();

        const enRes = await fetch('http://api.alquran.cloud/v1/quran/en.asad');
        const enData = await enRes.json();

        if (arData.code === 200 && enData.code === 200) {
            console.log('✅ Quran data fetched successfully. Writing to Firestore...');
            const surahs = arData.data.surahs;
            const enSurahs = enData.data.surahs;

            // Batch Write Surahs
            let batch = db.batch();
            let count = 0;

            for (let i = 0; i < surahs.length; i++) {
                const surah = surahs[i];
                const surahRef = db.collection('quran_surahs').doc(String(surah.number));
                batch.set(surahRef, {
                    id: String(surah.number),
                    index: surah.number,
                    nameArabic: surah.name,
                    nameEnglish: surah.englishName,
                    ayahCount: surah.ayahs.length,
                    order: surah.number
                });
                count++;
                if (count >= 400) { await batch.commit(); batch = db.batch(); count = 0; }
            }
            if (count > 0) { await batch.commit(); batch = db.batch(); count = 0; }
            console.log('✅ Surahs written.');

            // Batch Write Ayahs
            console.log('⏳ Writing 6236 Ayahs (this may take a minute)...');
            for (let i = 0; i < surahs.length; i++) {
                const surah = surahs[i];
                const enSurah = enSurahs[i];
                for (let j = 0; j < surah.ayahs.length; j++) {
                    const ayah = surah.ayahs[j];
                    const enAyah = enSurah.ayahs[j];

                    const ayahRef = db.collection('quran_ayahs').doc(`${surah.number}:${ayah.numberInSurah}`);
                    batch.set(ayahRef, {
                        id: `${surah.number}:${ayah.numberInSurah}`,
                        surahId: String(surah.number),
                        ayahNo: ayah.numberInSurah,
                        ayahNumber: ayah.number, // Absolute number
                        arabic: ayah.text,
                        juz: ayah.juz,
                        page: ayah.page,
                        translations: {
                            en: enAyah.text
                        }
                    });
                    count++;
                    if (count >= 400) { await batch.commit(); batch = db.batch(); count = 0; }
                }
            }
            if (count > 0) { await batch.commit(); batch = db.batch(); count = 0; }
            console.log('✅ Ayahs written.');

        }
    } catch (error: any) {
        console.error('❌ ERROR fetching/writing Quran data:', error.message);
    }

    // --- SUNNAH MODULE ---
    console.log('⏳ Writing Sunnah module data...');
    const sunnahs = [
        { title: 'Use Miswak', description: 'Clean your teeth before prayer.', reference: 'Bukhari', order: 1 },
        { title: 'Sleep Early', description: 'Sleep right after Isha prayer.', reference: 'Bukhari', order: 2 },
        { title: 'Smile', description: 'Smiling at your brother is charity.', reference: 'Tirmidhi', order: 3 },
        { title: 'Drink with Right Hand', description: 'Always use your right hand to eat and drink.', reference: 'Muslim', order: 4 },
        { title: 'Say Salam', description: 'Spread peace by saying Assalamu Alaikum.', reference: 'Muslim', order: 5 }
    ];
    try {
        let batch = db.batch();
        for (const s of sunnahs) {
            const ref = db.collection('sunnah').doc();
            batch.set(ref, { id: ref.id, ...s });
        }
        await batch.commit();
        console.log('✅ Sunnah data written.');
    } catch (error: any) {
        console.error('❌ ERROR writing Sunnah data:', error.message);
    }

    // --- JUZ META DATA ---
    console.log('⏳ Writing Juz metadata...');
    try {
        const { QURAN_JUZ_META } = require('../src/lib/data/quran-surah-meta');
        let batch = db.batch();
        for (const juz of QURAN_JUZ_META) {
            const ref = db.collection('quran_juzs').doc(String(juz.id));
            batch.set(ref, juz);
        }
        await batch.commit();
        console.log('✅ Juz metadata written.');
    } catch (error: any) {
        console.error('❌ ERROR writing Juz data:', error.message);
    }

    console.log('🎉 Seeding Complete! The app now has real data from Firestore.');
    process.exit(0);
}

main().catch(console.error);
