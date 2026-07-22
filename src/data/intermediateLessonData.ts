export interface LessonData {
  class: string;
  title: string;
  estimatedTime: string;
  storySteps: { id: number; text: string; icon?: string }[];
  storyQuestion: string;
  correctOrder: string[];
  badOrderMessage: string;
  goodOrderMessage: string;
  definition: {
    term: string;
    highlights: { word: string; color: string }[];
    fullText: string;
  };
  visualSteps: { id: number; label: string; icon: string }[];
  recipeComparison: { text: string };
  scaffoldPhases: {
    phase1: { title: string; steps: { id: number; text: string }[] };
    phase2: {
      title: string;
      steps: (
        | { id: number; text: string; visible: true }
        | { id: number; text: string; answer: string }
      )[];
    };
    phase2Activity2: {
      title: string;
      missing1: string;
      missing2: string;
    };
  };
  gamification: {
    levels: {
      id: number;
      title: string;
      steps: { id: string; text: string }[];
    }[];
  };
  challenge: {
    title: string;
    task: string;
    steps: { id: string; text: string }[];
  };
}

export const lessonData: LessonData = {
  class: 'Class 01',
  title: 'Algorithm (অ্যালগরিদম)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'বিছানা থেকে ওঠা', icon: '🌅' },
    { id: 2, text: 'ব্রাশ করা', icon: '🪥' },
    { id: 3, text: 'ইউনিফর্ম পরা', icon: '👔' },
    { id: 4, text: 'নাশতা করা', icon: '🍞' },
    { id: 5, text: 'স্কুলে যাওয়া', icon: '🏫' },
  ],

  storyQuestion:
    'এখন ভেবে দেখো, সকালে ঘুম থেকে ওঠার পর থেকে স্কুলে যাওয়া পর্যন্ত আমরা কেন একটি নির্দিষ্ট অনুসরণ করি?',

  correctOrder: ['নাশতা', 'ব্রাশ', 'ইউনিফর্ম', 'স্কুলে যাওয়া'],
  badOrderMessage: '❌ পুরো ব্যাপারটা এলোমেলো হয়ে যাবে।',
  goodOrderMessage:
    '✅ যেকোনো কাজ সঠিকভাবে শেষ করতে হলে কিছু নির্দিষ্ট ধাপ পর পর মেনে চলতে হয়।',

  definition: {
    term: 'অ্যালগরিদম (Algorithm)',
    highlights: [
      { word: 'পর পর সাজানো', color: 'text-green-500' },
      { word: 'সুনির্দিষ্ট ধাপ', color: 'text-blue-500' },
      { word: 'সমস্যা সমাধান', color: 'text-orange-500' },
    ],
    fullText:
      'অ্যালগরিদম (Algorithm) হলো কোনো সমস্যা সমাধানের জন্য পর পর সাজানো কিছু সুনির্দিষ্ট ধাপ।',
  },

  visualSteps: [
    { id: 1, label: 'শুরু', icon: '▶' },
    { id: 2, label: 'ধাপ ১', icon: '①' },
    { id: 3, label: 'ধাপ ২', icon: '②' },
    { id: 4, label: 'ধাপ ৩', icon: '③' },
    { id: 5, label: 'শেষ', icon: '✓' },
  ],

  recipeComparison: {
    text: 'রান্নার রেসিপির মতোই অ্যালগরিদম। যেমন একটি কেক বানাতে হলে প্রথমে উপকরণ সংগ্রহ, তারপর মিশ্রণ তৈরি, তারপর বেক করা — এই ধাপগুলো ঠিকভাবে অনুসরণ না করলে কেক ভালো হবে না। তেমনি প্রোগ্রামিংয়েও অ্যালগরিদমের প্রতিটি ধাপ সঠিকভাবে অনুসরণ করতে হয়।',
  },

  scaffoldPhases: {
    phase1: {
      title: 'গাইডেড প্র্যাকটিস (Guided Practice)',
      steps: [
        { id: 1, text: 'শুরু করি' },
        { id: 2, text: 'প্রথম সংখ্যাটি গ্রহণ করি' },
        { id: 3, text: 'দ্বিতীয় সংখ্যাটি গ্রহণ করি' },
        { id: 4, text: 'A + B = ?' },
        { id: 5, text: 'যোগফলটি প্রদর্শন করি' },
        { id: 6, text: 'শেষ করি' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'শুরু করি', visible: true },
        { id: 2, text: 'প্রথম সংখ্যাটি গ্রহণ করি', visible: true },
        { id: 3, text: '______', answer: 'দ্বিতীয় সংখ্যাটি গ্রহণ করি' },
        { id: 4, text: 'A + B = ?', answer: 'যোগফল' },
        { id: 5, text: 'যোগফলটি ________', answer: 'প্রদর্শন করি' },
        { id: 6, text: 'শেষ করি', visible: true },
      ],
    },
    phase2Activity2: {
      title: 'তিনটি সংখ্যা যোগ করতে হবে',
      missing1: 'C',
      missing2: 'A+B+C',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 1: স্কুলের রুটিন',
        steps: [
          { id: 'l1-1', text: 'বিছানা থেকে ওঠা' },
          { id: 'l1-2', text: 'ব্রাশ করা' },
          { id: 'l1-3', text: 'ইউনিফর্ম পরা' },
          { id: 'l1-4', text: 'নাশতা করা' },
          { id: 'l1-5', text: 'স্কুলে যাওয়া' },
        ],
      },
      {
        id: 2,
        title: 'Level 2: দুই সংখ্যা যোগ',
        steps: [
          { id: 'l2-1', text: 'শুরু করি' },
          { id: 'l2-2', text: 'প্রথম সংখ্যাটি গ্রহণ করি' },
          { id: 'l2-3', text: 'দ্বিতীয় সংখ্যাটি গ্রহণ করি' },
          { id: 'l2-4', text: 'A + B = ?' },
          { id: 'l2-5', text: 'যোগফলটি প্রদর্শন করি' },
          { id: 'l2-6', text: 'শেষ করি' },
        ],
      },
      {
        id: 3,
        title: 'Level 3: তিন সংখ্যা যোগ',
        steps: [
          { id: 'l3-1', text: 'প্রথম সংখ্যা (A) নাও' },
          { id: 'l3-2', text: 'দ্বিতীয় সংখ্যা (B) নাও' },
          { id: 'l3-3', text: 'তৃতীয় সংখ্যা (C) নাও' },
          { id: 'l3-4', text: 'A + B যোগ করো' },
          { id: 'l3-5', text: '(A+B) + C যোগ করো' },
          { id: 'l3-6', text: 'শেষ ফল দেখাও' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: 'তোমার জন্মদিনের কেক কাটার জন্য একটি ৫ ধাপের অ্যালগরিদম তৈরি করো।',
    steps: [
      { id: 'c-1', text: 'ছুরি পরিষ্কার করো' },
      { id: 'c-2', text: 'কেক সমান ভাগে চিহ্নিত করো' },
      { id: 'c-3', text: 'প্রথম টুকরো কাটো' },
      { id: 'c-4', text: 'প্রত্যেককে পরিবেশন করো' },
      { id: 'c-5', text: 'বাকি কেক সংরক্ষণ করো' },
    ],
  },
};

export const variablesData: LessonData = {
  class: 'Class 06',
  title: 'Variables (ভেরিয়েবল)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'ক্রিকেট খেলা দেখার সময় স্ক্রিনের এক কোণায় আমরা স্কোর দেখতে পাই।', icon: '🏏' },
    { id: 2, text: 'প্রতি বলে রান নেওয়ার সাথে সাথে সেই স্কোরবোর্ডের সংখ্যাটি বদলে যায়।', icon: '📊' },
    { id: 3, text: 'এই যে রান বা কয়েন রাখার জন্য একটি জায়গা, যা বারবার বদলাতে পারে, একেই বলে ভেরিয়েবল।', icon: '📦' },
    { id: 4, text: 'একে তুমি একটি লেবেল লাগানো বাক্সের মতো চিন্তা করতে পারো।', icon: '🏷️' },
  ],

  storyQuestion: 'কী বদলাচ্ছে?',
  correctOrder: ['Score', 'Variable'],
  badOrderMessage: '❌ আবার চেষ্টা করো।',
  goodOrderMessage: '✅ ভেরিয়েবল মানেই পরিবর্তনশীল!',

  definition: {
    term: 'Variable (ভেরিয়েবল)',
    highlights: [
      { word: 'Variable', color: 'text-green-500' },
      { word: 'Value', color: 'text-blue-500' },
      { word: 'মেমোরি', color: 'text-orange-500' },
      { word: 'তথ্য', color: 'text-purple-500' },
    ],
    fullText:
      'Variable (ভেরিয়েবল) হলো কম্পিউটার মেমোরিতে তথ্য সংরক্ষণের একটি জায়গা। এটির একটি নাম (Name) এবং একটি মান (Value) থাকে। প্রোগ্রাম চলাকালে এই মানটি পরিবর্তন করা যায়, কিন্তু নামটি একই থাকে। যেমন Score = 0 → Score = 1 — নাম একই, মান বদলে গেছে।',
  },

  visualSteps: [
    { id: 1, label: 'Variable', icon: '📦' },
    { id: 2, label: 'Name', icon: '🏷️' },
    { id: 3, label: 'Value', icon: '🔢' },
  ],

  recipeComparison: {
    text: 'ভেরিয়েবল হলো একটি লেবেল লাগানো বাক্সের মতো, যার মধ্যে যেকোনো সংখ্যা বা তথ্য রাখা যায় এবং বদলানো যায়।',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [
        { id: 1, text: 'Make a Variable → Create "Score"' },
        { id: 2, text: 'set Score to 0' },
        { id: 3, text: 'change Score by 1 → 0 → 1 → 2 → 3' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'Block 1', visible: true },
        { id: 2, text: '______', answer: 'Make a Variable' },
        { id: 3, text: '______', answer: 'set Score to 0' },
        { id: 4, text: '______', answer: 'change Score by 1' },
      ],
    },
    phase2Activity2: {
      title: 'ভেরিয়েবল তৈরি করো',
      missing1: 'Make a Variable',
      missing2: 'set Score to 0',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 6: Data Keeper',
        steps: [
          { id: 'l6-1', text: 'Life = 3 → hit → Life - 1' },
          { id: 'l6-2', text: 'Life = 0 → Game Over' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: 'একটি গেমের জন্য Life নামের একটি ভেরিয়েবল তৈরি করো।',
    steps: [
      { id: 'c-1', text: 'Make a Variable' },
      { id: 'c-2', text: 'set Life to 3' },
      { id: 'c-3', text: 'change Life by -1' },
    ],
  },
};
