export const QURAN_SURAHS = [
  {
    id: '1',
    nameArabic: 'الفاتحة',
    nameEnglish: 'Al-Fatiha',
    nameUrdu: 'سورہ فاتحہ',
    nameHindi: 'अल-फ़ातिहा',
    index: 1,
    ayahCount: 7,
  },
  {
    id: '112',
    nameArabic: 'الإخلاص',
    nameEnglish: 'Al-Ikhlas',
    nameUrdu: 'سورہ اخلاص',
    nameHindi: 'अल-इखलास',
    index: 112,
    ayahCount: 4,
  }
];

export const QURAN_AYAH_MOCK = [
  {
    surahId: '1',
    ayahNo: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismillāhir raḥmānir raḥīm',
    translation_en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    translation_ur: 'اللہ کے نام سے جو نہایت مہربان اور رحم والا ہے۔',
    translation_hi: 'अल्लाह के नाम से जो बहुत मेहरबान और रहम वाला है।',
  },
  {
    surahId: '1',
    ayahNo: 2,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: 'Alḥamdu lillāhi rabbil ʿālamīn',
    translation_en: '[All] praise is [due] to Allah, Lord of the worlds -',
    translation_ur: 'سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا رب ہے۔',
    translation_hi: 'सब तारीफ़ें अल्लाह ही के लिए हैं जो तमाम जहानों का रब है।',
  },
  {
    surahId: '112',
    ayahNo: 1,
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transliteration: 'Qul huwallāhu aḥad',
    translation_en: 'Say, "He is Allah, [who is] One,',
    translation_ur: 'کہہ دیجئے: وہ اللہ ایک ہے۔',
    translation_hi: 'कह दीजिये: वह अल्लाह एक है।',
  }
];

export const DUAS = [
  {
    id: 'sehri',
    title: 'Dua for Sehri (Suhur)',
    category: 'Sehri',
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: 'Wa bisawmi ghadinn nawaiytu min shahri ramadan',
    translation_en: 'I intend to keep the fast for tomorrow in the month of Ramadan',
    translation_ur: 'اور میں نے کل کے رمضان کے روزے کی نیت کی۔',
    translation_hi: 'और मैंने कल के रमज़ान के रोज़े की नियत की।',
  },
  {
    id: 'iftar',
    title: 'Dua for Iftar',
    category: 'Iftar',
    arabic: 'اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ [وَعَلَيْكَ تَوَكَّلْتُ] وَعَلَى رِزْقِكَ اَفْطَرْتُ',
    transliteration: 'Allahumma inni laka sumtu wa bika amantu wa alayka tawakkaltu wa ala rizqika aftartu',
    translation_en: 'O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance',
    translation_ur: 'اے اللہ! میں نے تیرے لیے روزہ رکھا اور تجھ پر ایمان لایا اور تیرے ہی عطا کردہ رزق سے افطار کیا۔',
    translation_hi: 'ए अल्लाह! मैंने तेरे लिए रोज़ा रखा और तुझ पर ईमान लाया और तेरे ही दिए हुए रिज़्क़ से इफ़्तार किया।',
  }
];

export const NAMAZ_STEPS = [
  {
    id: 'takbeer',
    title: 'Takbeer-e-Tahreema',
    instruction: 'Raise your hands to your ears and say:',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation_en: 'Allah is the Greatest',
    translation_ur: 'اللہ سب سے بڑا ہے۔',
    translation_hi: 'अल्लाह सबसे बड़ा है।',
  },
  {
    id: 'sana',
    title: 'Sana',
    instruction: 'Fold your hands over your chest (left hand under right) and recite:',
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
    transliteration: 'Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta’ala jadduka wa la ilaha ghairuk',
    translation_en: 'Glory be to You, O Allah, and all praise. Blessed is Your name and exalted is Your majesty. There is no god besides You.',
    translation_ur: 'پاک ہے تو اے اللہ! اپنی تعریفوں کے ساتھ، اور مبارک ہے تیرا نام، اور بلند ہے تیری بزرگی، اور تیرے سوا کوئی معبود نہیں۔',
    translation_hi: 'पाक है तू ऐ अल्लाह! अपनी तारीफों के साथ, और मुबारक है तेरा नाम, और बुलंद है तेरी बुजु़र्गी, और तेरे सिवा कोई माबूद नहीं।',
  }
];