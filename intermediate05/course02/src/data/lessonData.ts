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
    'এখন ভেবে দেখো, সকালে ঘুম থেকে ওঠার পর থেকে স্কুলে যাওয়া পর্যন্ত আমরা কেন একটি নির্দিষ্ট顺序 অনুসরণ করি?',

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

export const flowchartData: LessonData = {
  class: 'Class 02',
  title: 'Flowchart (ফ্লোচার্ট)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'তুমি একটি নতুন খেলনা বা টেবিল কিনেছ যা পার্ট পার্ট করা আছে。', icon: '🧩' },
    { id: 2, text: 'এটি জোড়া লাগানোর জন্য বাক্সের ভেতরে একটি কাগজ থাকে।', icon: '📦' },
    { id: 3, text: 'কোনো লেখা থাকে না।', icon: '📄' },
    { id: 4, text: 'শুধু তির চিহ্ন দিয়ে ছবির মাধ্যমে দেখানো হয় কোন অংশের পর কোন অংশ জোড়া দিতে হবে।', icon: '➡️' },
    { id: 5, text: 'ছবি দেখে কাজটি করা অনেক সহজ হয়।', icon: '🖼️' },
  ],

  storyQuestion: 'ছবি দেখে কাজটি করা অনেক সহজ হয় — কেন?',

  correctOrder: [
    'বাক্স খোলা',
    'পার্ট পরীক্ষা',
    'ছবি দেখা',
    'জোড়া লাগানো',
  ],
  badOrderMessage: '❌ আবার চেষ্টা করো।',
  goodOrderMessage: '✅ ছবি দেখে কাজটি করা অনেক সহজ হয়।',

  definition: {
    term: 'ফ্লোচার্ট (Flowchart)',
    highlights: [
      { word: 'Flowchart', color: 'text-green-500' },
      { word: 'প্রবাহচিত্র', color: 'text-blue-500' },
      { word: 'প্রতীক', color: 'text-orange-500' },
      { word: 'চিত্ররূপ', color: 'text-purple-500' },
    ],
    fullText:
      'প্রোগ্রামিংয়ের কাজে ধাপগুলো বোঝানোর জন্য ছবি বা প্রতীক ব্যবহার করে একটি চিত্র তৈরি করা হয়, একেই বলা হয় ফ্লোচার্ট (Flowchart) বা প্রবাহচিত্র। অ্যালগরিদমের প্রতিটি ধাপকে বিভিন্ন প্রতীক বা চিহ্নের মাধ্যমে চিত্ররূপে দেখানো হয়।',
  },

  visualSteps: [
    { id: 1, label: 'Oval', icon: '⬭' },
    { id: 2, label: 'Parallelogram', icon: '▱' },
    { id: 3, label: 'Rectangle', icon: '▬' },
    { id: 4, label: 'Arrow', icon: '→' },
  ],

  recipeComparison: {
    text: 'প্রোগ্রামিংয়ের কাজে ধাপগুলো বোঝানোর জন্য ছবি বা প্রতীক ব্যবহার করে একটি চিত্র তৈরি করা হয়, একেই বলা হয় ফ্লোচার্ট (Flowchart) বা প্রবাহচিত্র।',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [
        { id: 1, text: 'Oval — Start' },
        { id: 2, text: 'Parallelogram — Input A, B' },
        { id: 3, text: 'Rectangle — Sum = A + B' },
        { id: 4, text: 'Parallelogram — Print Sum' },
        { id: 5, text: 'Oval — End' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'Oval', visible: true },
        { id: 2, text: '______', answer: 'Parallelogram' },
        { id: 3, text: '______', answer: 'Rectangle' },
        { id: 4, text: '______', answer: 'Parallelogram' },
        { id: 5, text: 'Oval', visible: true },
      ],
    },
    phase2Activity2: {
      title: 'ফ্লোচার্ট সম্পূর্ণ করো',
      missing1: 'Rectangle',
      missing2: 'Arrow',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 1: Flowchart Basics',
        steps: [
          { id: 'f1-1', text: 'Oval' },
          { id: 'f1-2', text: 'Arrow' },
          { id: 'f1-3', text: 'Parallelogram' },
          { id: 'f1-4', text: 'Rectangle' },
          { id: 'f1-5', text: 'Arrow' },
          { id: 'f1-6', text: 'Oval' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: 'বাড়ি থেকে বের হয়ে স্কুলে পৌঁছানোর একটি ফ্লোচার্ট আঁকো।',
    steps: [
      { id: 'c-1', text: 'Start' },
      { id: 'c-2', text: 'বাড়ি থেকে বের হওয়া' },
      { id: 'c-3', text: 'পথ অতিক্রম করা' },
      { id: 'c-4', text: 'স্কুলে পৌঁছানো' },
      { id: 'c-5', text: 'End' },
    ],
  },
};

export const programmingLogicData: LessonData = {
  class: 'Class 04',
  title: 'Programming Logic',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'বাইরে বৃষ্টি হচ্ছে।', icon: '🌧️' },
    { id: 2, text: 'তুমি যদি ছাতা নিয়ে বাইরে যাও, তবে তুমি ভিজবে না।', icon: '☂️' },
    { id: 3, text: 'এখানে একটি লজিক বা যুক্তি কাজ করছে।', icon: '🧠' },
    { id: 4, text: 'আমাদের জীবনের প্রায় প্রতিটি সিদ্ধান্তই এমন যুক্তির ওপর নির্ভর করে।', icon: '⚖️' },
  ],

  storyQuestion: 'তুমি কী করবে?',
  correctOrder: ['ছাতা নাও', 'ছাতা নিও না'],
  badOrderMessage: '❌ ভুল সিদ্ধান্ত!',
  goodOrderMessage: '✅ ঠিক আছে!',

  definition: {
    term: 'Programming Logic (প্রোগ্রামিং লজিক)',
    highlights: [
      { word: 'Programming Logic', color: 'text-green-500' },
      { word: 'True', color: 'text-blue-500' },
      { word: 'False', color: 'text-orange-500' },
      { word: 'শর্ত', color: 'text-purple-500' },
    ],
    fullText:
      'Programming Logic (প্রোগ্রামিং লজিক) হলো শর্ত (Condition) যাচাই করার একটি পদ্ধতি। কোনো শর্ত যদি সত্য (True) হয়, তাহলে একটি কাজ করে; আর যদি মিথ্যা (False) হয়, তাহলে অন্য একটি কাজ করে। এটাই প্রোগ্রামিংয়ের মূল ভিত্তি।',
  },

  visualSteps: [
    { id: 1, label: 'Condition', icon: '❓' },
    { id: 2, label: 'True', icon: '✅' },
    { id: 3, label: 'False', icon: '❌' },
  ],

  recipeComparison: {
    text: 'প্রোগ্রামিং লজিক হলো শর্ত যাচাই করার পদ্ধতি। কোনো শর্ত সত্য হলে এক কাজ, মিথ্যা হলে অন্য কাজ।',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [
        { id: 1, text: '"If Score > 50" দেখো' },
        { id: 2, text: 'Computer শর্তটি পরীক্ষা করে' },
        { id: 3, text: 'Score = 55 → True → "You Win!"' },
        { id: 4, text: 'Score = 45 → False → "Try Again!"' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'Score', visible: true },
        { id: 2, text: '______', answer: 'True / False' },
        { id: 3, text: '______', answer: 'You Win! / Try Again!' },
      ],
    },
    phase2Activity2: {
      title: 'শর্ত যাচাই করো',
      missing1: 'রেজাল্ট',
      missing2: 'বার্তা',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 4: Logic Architect',
        steps: [
          { id: 'l4-1', text: '🔴 Red Light → থামাও' },
          { id: 'l4-2', text: '🟢 Green Light → চালাও' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: 'একটি ট্রাফিক সিগন্যালের লজিক তৈরি করো।',
    steps: [
      { id: 'c-1', text: 'যদি বাতি লাল হয়' },
      { id: 'c-2', text: 'গাড়ি থামাও' },
      { id: 'c-3', text: 'গাড়ি চালাও' },
    ],
  },
};

export const loopsData: LessonData = {
  class: 'Class 05',
  title: 'Introduction to Loops',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'তোমাকে যদি কাগজের পাতায় ১ থেকে ১০০ পর্যন্ত সংখ্যাগুলো লিখতে বলা হয়।', icon: '📝' },
    { id: 2, text: 'তুমি একই কলম দিয়ে বারবার ১, ২, ৩ এভাবে একই পদ্ধতিতে লিখে যাবে।', icon: '✍️' },
    { id: 3, text: 'যতক্ষণ না ১০০ পর্যন্ত পৌঁছাচ্ছো।', icon: '🔁' },
    { id: 4, text: 'এই যে একই কাজ বারবার করা, একেই বলে লুপ।', icon: '🔄' },
  ],

  storyQuestion: 'কী হচ্ছে এখানে?',
  correctOrder: ['Repeat', 'Loop'],
  badOrderMessage: '❌ আবার চেষ্টা করো।',
  goodOrderMessage: '✅ একই কাজ বারবার করাকেই লুপ বলে!',

  definition: {
    term: 'Loop (লুপ)',
    highlights: [
      { word: 'Loop', color: 'text-green-500' },
      { word: 'বারবার', color: 'text-blue-500' },
      { word: 'পুনরাবৃত্তি', color: 'text-orange-500' },
      { word: 'একটি মাত্র নির্দেশ', color: 'text-purple-500' },
    ],
    fullText:
      'লুপ (Loop) হলো প্রোগ্রামিংয়ের একটি শক্তিশালী কাঠামো যা একটি মাত্র নির্দেশ বা নির্দেশসমূহকে বারবার পুনরাবৃত্তি করতে দেয়। এটি কোডকে ছোট, পরিষ্কার এবং দক্ষ করে তোলে। লুপ ব্যবহার করে আমরা কয়েক লাইন কোড দিয়েই শত শত কাজ করতে পারি।',
  },

  visualSteps: [
    { id: 1, label: 'Start', icon: '▶' },
    { id: 2, label: 'Repeat 10', icon: '🔁' },
    { id: 3, label: 'Forever', icon: '♾️' },
  ],

  recipeComparison: {
    text: 'লুপ হলো প্রোগ্রামিংয়ের একটি কাঠামো যা একটি নির্দেশকে বারবার পুনরাবৃত্তি করতে দেয়। যেমন ১০ বার Jump করো — এক লাইনেই কাজ শেষ!',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [
        { id: 1, text: 'Sprite দেখো' },
        { id: 2, text: '১০টি আলাদা Jump ব্লক' },
        { id: 3, text: 'Repeat 10 দিয়ে প্রতিস্থাপন' },
        { id: 4, text: 'Jump ব্লকটি লুপের ভিতরে বসাও' },
        { id: 5, text: 'Sprite ১০ বার লাফায়!' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'Workspace', visible: true },
        { id: 2, text: '______', answer: 'Repeat 10' },
        { id: 3, text: '______', answer: 'Jump' },
      ],
    },
    phase2Activity2: {
      title: 'লুপ তৈরি করো',
      missing1: 'Repeat 10',
      missing2: 'Jump',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 5: Infinity Coder',
        steps: [
          { id: 'l5-1', text: 'Forever → Move' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: 'একটি স্প্রাইটকে স্ক্রিনের বাম থেকে ডানে আজীবন বা চিরকাল হাঁটাতে হবে।',
    steps: [
      { id: 'c-1', text: 'Forever' },
      { id: 'c-2', text: 'Move' },
    ],
  },
};

export const eventsData: LessonData = {
  class: 'Class 03',
  title: 'Events (Programming Basics)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'তুমি যখন টেলিভিশনের রিমোটের পাওয়ার বাটনে চাপ দাও।', icon: '📺' },
    { id: 2, text: 'যখন ঘরের লাইটের সুইচে চাপ দাও।', icon: '💡' },
    { id: 3, text: 'এখানে সুইচে চাপ দেওয়া বা রিমোটের বাটন টেপা হলো এক একটি ঘটনা বা অ্যাকশন।', icon: '⚡' },
    { id: 4, text: 'এই ঘটনাগুলোর কারণেই কিন্তু পরের কাজটি ঘটছে।', icon: '🔄' },
  ],

  storyQuestion: 'কোন ঘটনাটি ঘটলে কী হয়? নিচের বাটনগুলো ক্লিক করে দেখো:',

  correctOrder: ['Power Button', 'Light Switch'],
  badOrderMessage: '❌ আবার চেষ্টা করো।',
  goodOrderMessage: '✅ ইভেন্টই প্রোগ্রামকে বলে দেয় কখন কী করতে হবে!',

  definition: {
    term: 'Event (ইভেন্ট)',
    highlights: [
      { word: 'Event', color: 'text-green-500' },
      { word: 'Scratch', color: 'text-blue-500' },
      { word: 'Action', color: 'text-orange-500' },
      { word: 'মাউসে ক্লিক', color: 'text-purple-500' },
      { word: 'কীবোর্ড', color: 'text-rose-500' },
    ],
    fullText:
      'Event (ইভেন্ট) হলো প্রোগ্রামিংয়ের একটি বিশেষ ঘটনা যা প্রোগ্রামকে বলে দেয় কখন এবং কীভাবে কাজ শুরু করতে হবে। Scratch-এ বিভিন্ন ধরণের Event Block আছে — যেমন Green Flag ক্লিক করা, স্পেস বাটন চাপা, বা মাউসে ক্লিক করা। Event Blocks প্রোগ্রামের শুরু এবং অন্যান্য ব্লকের সক্রিয়তা নিয়ন্ত্রণ করে।',
  },

  visualSteps: [
    { id: 1, label: 'Oval', icon: '⬭' },
    { id: 2, label: 'Parallelogram', icon: '▱' },
    { id: 3, label: 'Rectangle', icon: '▬' },
    { id: 4, label: 'Arrow', icon: '→' },
  ],

  recipeComparison: {
    text: 'Event Blocks হল প্রোগ্রামের ট্রিগার। যেমন রিমোটের বাটন চাপলে টিভি অন হয় — তেমনি Green Flag ক্লিক করলে Scratch প্রোগ্রাম শুরু হয়।',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [
        { id: 1, text: 'Scratch Sprite দেখো' },
        { id: 2, text: '"When Green Flag Clicked" ব্লক টেনে আনো' },
        { id: 3, text: '"move 10 steps" ব্লক যোগ করো' },
        { id: 4, text: 'ব্লক দুটি অটোমেটিক কানেক্ট হলো' },
        { id: 5, text: 'Green Flag এ ক্লিক করে Sprite-কে নড়তে দেখো' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'Workspace', visible: true },
        { id: 2, text: '______', answer: 'When Green Flag Clicked' },
        { id: 3, text: '______', answer: 'move 10 steps' },
        { id: 4, text: 'Run', visible: true },
      ],
    },
    phase2Activity2: {
      title: 'ব্লক সংযোগ করো',
      missing1: 'Hat Block',
      missing2: 'Motion Block',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 1: Event Trigger',
        steps: [
          { id: 'e1-1', text: 'Green Flag' },
          { id: 'e1-2', text: 'Space Key' },
          { id: 'e1-3', text: 'Up Arrow' },
          { id: 'e1-4', text: 'Down Arrow' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: "একটি প্রোগ্রাম ডিজাইন করো যেখানে কীবোর্ডের 'Up Arrow' বাটন চাপলে বিড়ালটি উপরের দিকে যাবে এবং 'Down Arrow' বাটন চাপলে বিড়ালটি নিচের দিকে নামবে।",
    steps: [
      { id: 'c-1', text: 'When Up Arrow Pressed' },
      { id: 'c-2', text: 'Move Up' },
      { id: 'c-3', text: 'When Down Arrow Pressed' },
      { id: 'c-4', text: 'Move Down' },
    ],
  },
};

export const ifElseData: LessonData = {
  class: 'Class 07',
  title: 'If-Else (সিদ্ধান্ত গ্রহণ)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [
    { id: 1, text: 'তুমি স্কুলের পরীক্ষার খাতা হাতে পেয়েছ।', icon: '📝' },
    { id: 2, text: 'যদি তুমি ৮০ বা তার বেশি পাও, তবে তুমি "A+" গ্রেড পাবে।', icon: '🎯' },
    { id: 3, text: 'অন্যথায় (৮০ এর কম পেলে) তুমি সাধারণ গ্রেড পাবে।', icon: '📄' },
    { id: 4, text: 'এখানে দুটি মাত্র পথ আছে—হয় শর্ত সত্যি হবে, না হয় মিথ্যা হবে।', icon: '⚖️' },
  ],

  storyQuestion: 'শর্ত সত্যি নাকি মিথ্যা?',
  correctOrder: ['True', 'False'],
  badOrderMessage: '❌ আবার চেষ্টা করো।',
  goodOrderMessage: '✅ সঠিক! শর্ত সত্যি হলে এক কাজ, মিথ্যা হলে অন্য কাজ।',

  definition: {
    term: 'If-Else (সিদ্ধান্ত গ্রহণ)',
    highlights: [
      { word: 'If', color: 'text-green-500' },
      { word: 'Else', color: 'text-orange-500' },
      { word: 'শর্ত', color: 'text-blue-500' },
      { word: 'সত্য', color: 'text-purple-500' },
      { word: 'মিথ্যা', color: 'text-red-500' },
    ],
    fullText:
      'If-Else হলো প্রোগ্রামিংয়ের একটি সিদ্ধান্ত গ্রহণের কাঠামো। একটি শর্ত (Condition) পরীক্ষা করা হয় — শর্তটি যদি সত্য (True) হয় তবে একটি ব্লক চলবে, আর যদি মিথ্যা (False) হয় তবে অন্য ব্লক চলবে। একেই বলে If-Else বা সিদ্ধান্ত গ্রহণ।',
  },

  visualSteps: [
    { id: 1, label: 'Condition', icon: '❓' },
    { id: 2, label: 'True', icon: '✅' },
    { id: 3, label: 'Else', icon: '❌' },
  ],

  recipeComparison: {
    text: 'If-Else হলো সিদ্ধান্ত গ্রহণের কাঠামো। শর্ত সত্য হলে এক কাজ, মিথ্যা হলে অন্য কাজ। যেমন — যদি পরীক্ষায় পাস করো তবে পুরস্কার, নাহলে পড়াশোনা চালিয়ে যাও।',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [
        { id: 1, text: 'Score >= 50' },
        { id: 2, text: 'Insert into If Condition' },
        { id: 3, text: 'Place say "পাস!" inside Then' },
        { id: 4, text: 'Place say "ফেল!" inside Else' },
      ],
    },
    phase2: {
      title: 'তুমি নিজে করো (Try Yourself)',
      steps: [
        { id: 1, text: 'Available blocks: If, Score >= 50, say "পাস!", Else, say "ফেল!"', visible: true },
        { id: 2, text: '______', answer: 'If' },
        { id: 3, text: '______', answer: 'Score >= 50' },
        { id: 4, text: '______', answer: 'say "পাস!"' },
        { id: 5, text: '______', answer: 'Else' },
        { id: 6, text: '______', answer: 'say "ফেল!"' },
      ],
    },
    phase2Activity2: {
      title: 'If-Else গঠন তৈরি করো',
      missing1: 'শর্ত',
      missing2: 'ফলাফল',
    },
  },

  gamification: {
    levels: [
      {
        id: 1,
        title: 'Level 7: Decision Maker',
        steps: [
          { id: 'l7-1', text: 'Password = "1234" → ✅ স্বাগতম!' },
          { id: 'l7-2', text: 'Password ≠ "1234" → ❌ ভুল পাসওয়ার্ড!' },
        ],
      },
    ],
  },

  challenge: {
    title: 'চ্যালেঞ্জ',
    task: 'একটি পাসওয়ার্ড চেকিং সিস্টেমের লজিক তৈরি করো।',
    steps: [
      { id: 'c-1', text: 'If' },
      { id: 'c-2', text: 'Password = "1234"' },
      { id: 'c-3', text: 'say "স্বাগতম!"' },
      { id: 'c-4', text: 'Else' },
      { id: 'c-5', text: 'say "ভুল পাসওয়ার্ড!"' },
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

export const operatorsData: LessonData = {
  class: 'Class 08',
  title: 'Operators (অংক ও তুলনা)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [],
  storyQuestion: '',
  correctOrder: [],
  badOrderMessage: '',
  goodOrderMessage: '',

  definition: {
    term: 'Operators (অপারেটর)',
    highlights: [
      { word: 'Operators', color: 'text-green-500' },
      { word: 'যোগ', color: 'text-blue-500' },
      { word: 'বিয়োগ', color: 'text-orange-500' },
      { word: 'তুলনা', color: 'text-purple-500' },
      { word: 'গাণিতিক', color: 'text-rose-500' },
    ],
    fullText:
      'প্রোগ্রামিংয়ে Operators (অপারেটর) হলো এমন কিছু চিহ্ন যা দিয়ে গাণিতিক কাজ (যেমন যোগ, বিয়োগ) এবং তুলনা করা যায়।',
  },

  visualSteps: [],
  recipeComparison: {
    text: '',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [],
    },
    phase2: {
      title: 'Try Yourself',
      steps: [],
    },
    phase2Activity2: {
      title: '',
      missing1: '',
      missing2: '',
    },
  },

  gamification: {
    levels: [],
  },

  challenge: {
    title: 'Challenge',
    task: 'একটি ক্যালকুলেটরের কোড ডিজাইন করো যা দুটি ভেরিয়েবল Num1 এবং Num2 কে গুণ করবে।',
    steps: [],
  },
};

export const sensingData: LessonData = {
  class: 'Class 09',
  title: 'Sensing (অনুভূতি ও টাচ)',
  estimatedTime: '15-20 মিনিট',

  storySteps: [],
  storyQuestion: '',
  correctOrder: [],
  badOrderMessage: '',
  goodOrderMessage: '',

  definition: {
    term: 'Sensing (সেন্সিং)',
    highlights: [
      { word: 'Sensing', color: 'text-green-500' },
      { word: 'Touch', color: 'text-blue-500' },
      { word: 'Mouse', color: 'text-orange-500' },
      { word: 'Keyboard', color: 'text-purple-500' },
      { word: 'স্প্রাইট', color: 'text-rose-500' },
    ],
    fullText:
      'Sensing (সেন্সিং) হলো এমন একটি ব্যবস্থা যার মাধ্যমে স্প্রাইট বুঝতে পারে সে কোন কিছু ছুঁয়েছে কিনা, কিংবা Mouse বা Keyboard এ কোন ইনপুট দেওয়া হয়েছে কিনা।',
  },

  visualSteps: [],
  recipeComparison: {
    text: '',
  },

  scaffoldPhases: {
    phase1: {
      title: 'Watch & Learn',
      steps: [],
    },
    phase2: {
      title: 'Try Yourself',
      steps: [],
    },
    phase2Activity2: {
      title: '',
      missing1: '',
      missing2: '',
    },
  },

  gamification: {
    levels: [],
  },

  challenge: {
    title: 'Challenge',
    task: 'মাউসের কার্সার স্প্রাইটের উপর নিয়ে গেলে স্প্রাইটটি বলবে "তুমি আমাকে ছুঁয়েছ!"',
    steps: [],
  },
};

export const soundBackgroundData: LessonData = {
  class: 'Class 10',
  title: 'Background & Sound',
  estimatedTime: '15-20 মিনিট',

  storySteps: [],
  storyQuestion: '',
  correctOrder: [],
  badOrderMessage: '',
  goodOrderMessage: '',

  definition: {
    term: 'Background & Sound (ব্যাকগ্রাউন্ড ও সাউন্ড)',
    highlights: [
      { word: 'Background', color: 'text-green-500' },
      { word: 'Backdrop', color: 'text-blue-500' },
      { word: 'Sound', color: 'text-orange-500' },
      { word: 'অডিও', color: 'text-purple-500' },
      { word: 'মিউজিক', color: 'text-rose-500' },
    ],
    fullText:
      'Scratch-এ Background বা Backdrop হলো স্টেজের পেছনের দৃশ্য, এবং Sound হলো সেই দৃশ্যের সাথে মিল অডিও বা মিউজিক। সঠিক Backdrop ও Sound ব্যবহার করে প্রোগ্রামকে আরও জীবন্ত করা যায়।',
  },

  visualSteps: [],
  recipeComparison: { text: '' },

  scaffoldPhases: {
    phase1: { title: 'Watch & Learn', steps: [] },
    phase2: { title: 'Try Yourself', steps: [] },
    phase2Activity2: { title: '', missing1: '', missing2: '' },
  },

  gamification: { levels: [] },

  challenge: {
    title: 'Challenge',
    task: 'কীবোর্ডের \'S\' বাটন চাপলে বনের পাখির ডাক শোনা যাবে এবং ব্যাকগ্রাউন্ডে একটি জঙ্গল দেখা যাবে।',
    steps: [],
  },
};
