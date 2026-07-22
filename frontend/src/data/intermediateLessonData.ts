type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};
export type LessonContent = DeepPartial<LessonData>;

export interface LessonData {
  class: string;
  title: string;
  estimatedTime: string;
  // Reading-mode content. The base flat fields below ARE the `medium` content.
  // `short` / `long` override the base when authored; an absent mode falls back
  // to a generated placeholder so the Short/Medium/Long tabs always work.
  short?: LessonContent;
  medium?: LessonContent;
  long?: LessonContent;
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
  short: {
    storySteps: [
      { id: 1, text: 'রান্নাঘরে কাজ করতে ধাপ মানতে হয়।', icon: '🍳' },
      { id: 2, text: 'ডিম সিদ্ধ করতে সঠিক ক্রমে ধাপ নিতে হয়।', icon: '🥚' },
      { id: 3, text: 'এই ধাপের তালিকাই হলো অ্যালগরিদম।', icon: '📋' },
    ],
    definition: {
      fullText: 'অ্যালগরিদম হলো কোনো কাজ করার ধাপে ধাপে নিয়ম। যেমন ডিম সিদ্ধ করতে: পানি ফোটানো → ডিম দেওয়া → সিদ্ধ করা → তোলা। কম্পিউটারেও সমস্যা সমাধানে এমন ধাপ ব্যবহার হয়।',
    },
    recipeComparison: {
      text: 'রান্নার রেসিপি = অ্যালগরিদম। ধাপ ভুল হলে ডিম ঠিকমতো সিদ্ধ হবে না।',
    },
    challenge: {
      task: 'কেক কাটার ৫টি সংক্ষিপ্ত ধাপ লিখো।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'তুমি রান্নাঘরে একটি কাজ করতে চাও — যেমন ডিম সিদ্ধ করা।', icon: '🍳' },
      { id: 2, text: 'প্রথমে পানি ফোটাতে হবে, তারপর ডিম দিতে হবে — ধাপের ক্রম গুরুত্বপূর্ণ।', icon: '🔥' },
      { id: 3, text: 'নির্দিষ্ট সময় পর্যন্ত সিদ্ধ করে তবে ডিম তুলতে হবে।', icon: '⏲️' },
      { id: 4, text: 'একই কাজ বারবার একই ভাবে করতে এই ধাপের তালিকা কাজে লাগে।', icon: '🔁' },
      { id: 5, text: 'কম্পিউটারেও ঠিক এমনি ধাপে ধাপে নির্দেশ দিয়ে সমস্যা সমাধান করা হয় — একে বলে অ্যালগরিদম।', icon: '💡' },
    ],
    definition: {
      fullText: 'অ্যালগরিদম (Algorithm) হলো কোনো সমস্যা সমাধানের জন্য ধাপে ধাপে দেওয়া নির্দেশের একটি সুনির্দিষ্ট ক্রম। প্রতিটি ধাপ স্পষ্ট এবং ক্রমটি ঠিক থাকতে হয়। উদাহরণ: ডিম সিদ্ধ করতে — (১) পানি ফোটাও, (২) ডিম দাও, (৩) ৫ মিনিট সিদ্ধ করো, (৪) ডিম তুলো। যদি ধাপের ক্রম ভুল হয় (যেমন আগে ডিম দাও পরে পানি ফোটাও) তবে কাজটি ঠিক হবে না। কম্পিউটার প্রোগ্রামও আসলে একটি অ্যালগরিদমের বাস্তব রূপ। টিপস: ভালো অ্যালগরিদম লিখতে প্রতিটি ধাপ ছোট ও বোধগম্য রাখো, যাতে যে কেউ (বা কম্পিউটার) তা অনুসরণ করতে পারে।',
    },
    recipeComparison: {
      text: 'রান্নার রেসিপি আর অ্যালগরিদম একই ধারণা: দুটিই ধাপে ধাপে নির্দেশ। যদি রেসিপিতে লেখা থাকে "আগে চাল ধোয়, তারপর চড়াও" — ক্রমটি মানতে হবে। একই ভাবে প্রোগ্রামেও ক্রম মানতে হয়, নাহলে ফলাফল ভুল হবে।',
    },
    challenge: {
      task: 'তোমার জন্মদিনের কেক কাটার জন্য একটি ৫ ধাপের অ্যালগরিদম তৈরি করো: (১) ছুরি পরিষ্কার করো, (২) কেক সমান ভাগে চিহ্নিত করো, (৩) প্রথম টুকরো কাটো, (৪) প্রত্যেককে পরিবেশন করো, (৫) বাকি কেক সংরক্ষণ করো। প্রতিটি ধাপ আলাদা লাইনে লিখো।',
    },
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
  short: {
    storySteps: [
      { id: 1, text: 'রাস্তায় যাওয়ার অনেক পথ থাকতে পারে।', icon: '🗺️' },
      { id: 2, text: 'সঠিক পথ বাছতে ধাপে ধাপে সিদ্ধান্ত নিতে হয়।', icon: '🔀' },
      { id: 3, text: 'এই চিত্রেই বলে ফ্লোচার্ট।', icon: '📊' },
    ],
    definition: {
      fullText: 'ফ্লোচার্ট হলো একটি ছবির মতো নকশা যা দিয়ে ধাপ ও সিদ্ধান্ত দেখানো হয়। বিভিন্ন আকার (গোল, চতুর্ভুজ) ব্যবহার করে কাজের প্রবাহ বোঝায়।',
    },
    recipeComparison: {
      text: 'রাস্তার মানচিত্র = ফ্লোচার্ট। ঠিকানা ভুল হলে গন্তব্যে পৌঁছানো যাবে না।',
    },
    challenge: {
      task: 'বাড়ি থেকে স্কুলে যাওয়ার একটি সংক্ষিপ্ত ফ্লোচার্ট আঁকো।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'তুমি বাড়ি থেকে স্কুলে যাচ্ছ — রাস্তায় অনেক মোড় আছে।', icon: '🚶' },
      { id: 2, text: 'প্রথম মোড়ে বাম নাকি ডান? এটি একটি সিদ্ধান্ত (Decision)।', icon: '🔀' },
      { id: 3, text: 'প্রতিটি সিদ্ধান্ত ও কাজকে ছোট ছবি দিয়ে দেখালে তৈরি হয় ফ্লোচার্ট।', icon: '📊' },
      { id: 4, text: 'গোল আকৃতি = শুরু/শেষ, চতুর্ভুজ = কাজ, হীরা = সিদ্ধান্ত।', icon: '⬭' },
      { id: 5, text: 'ফ্লোচার্ট দেখে যে কেউ একই ভাবে কাজটি করতে পারে।', icon: '✅' },
    ],
    definition: {
      fullText: 'ফ্লোচার্ট (Flowchart) হলো একটি চিত্রকল্প নকশা যা দিয়ে কোনো প্রক্রিয়ার ধাপ ও সিদ্ধান্তগুলো আকার ব্যবহার করে দেখানো হয়। সাধারণত: ওভাল/গোল = শুরু বা শেষ, আয়তক্ষেত্র = কোনো কাজ (Process), সামান্তরিক = ইনপুট/আউটপুট, এবং হীরা/রম্বস = সিদ্ধান্ত (Yes/No)। তীর (Arrow) দিয়ে ধাপের স্রোত দেখানো হয়। টিপস: জটিল কাজকে ফ্লোচার্টে আঁকলে ভুল কম হয় এবং অন্যরাও বুঝতে পারে। প্রোগ্রাম লেখার আগে ফ্লোচার্ট এঁকে নিলে লজিক পরিষ্কার হয়।',
    },
    recipeComparison: {
      text: 'রাস্তার মানচিত্র আর ফ্লোচার্ট একই কাজ করে: দুটিই পথ দেখায়। মানচিত্রে ভুল ঠিকানা থাকলে তুমি ভুল জায়গায় পৌঁছাও; ফ্লোচার্টে ভুল ধাপ থাকলে প্রোগ্রাম ভুল ফল দেয়। তাই দুটিতেই সঠিক ক্রম রাখা জরুরি।',
    },
    challenge: {
      task: 'বাড়ি থেকে বের হয়ে স্কুলে পৌঁছানোর একটি ফ্লোচার্ট আঁকো। ব্যবহার করো: শুরু (গোল) → বের হও → মোড়ে সিদ্ধান্ত (হীরা) → স্কুল (গোল)। প্রতিটি ধাপে তীর দিয়ে সংযোগ দাও।',
    },
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
  short: {
    storySteps: [
      { id: 1, text: 'বাইরে বৃষ্টি হচ্ছে, তাই ছাতা নিলে ভিজবে না।', icon: '🌧️' },
      { id: 2, text: 'শর্ত পূরণ হলে এক কাজ, নাহলে অন্য।', icon: '⚖️' },
      { id: 3, text: 'এই যুক্তিই হলো প্রোগ্রামিং লজিক।', icon: '🧠' },
    ],
    definition: {
      fullText: 'Programming Logic হলো শর্ত (Condition) যাচাইয়ের পদ্ধতি: শর্ত সত্য (True) হলে এক কাজ, মিথ্যা (False) হলে অন্য কাজ।',
    },
    recipeComparison: {
      text: 'ট্রাফিক সিগন্যাল = লজিক। লাল হলে থামো, সবুজ হলে যাও।',
    },
    challenge: {
      task: 'লাল/সবুজ বাতির ওপর ভিত্তি করে গাড়ি চালানোর লজিক লিখো।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'বাইরে বৃষ্টি হচ্ছে।', icon: '🌧️' },
      { id: 2, text: 'তুমি যদি ছাতা নিয়ে যাও, তবে ভিজবে না — এখানে একটি যুক্তি কাজ করছে।', icon: '☂️' },
      { id: 3, text: 'জীবনের প্রায় প্রতিটি সিদ্ধান্তই এমন শর্তের ওপর নির্ভর করে।', icon: '⚖️' },
      { id: 4, text: 'প্রোগ্রামে "if" দিয়ে শর্ত, "else" দিয়ে বিকল্প পথ দেখানো হয়।', icon: '🔀' },
      { id: 5, text: 'এই শর্ত-ভিত্তিক যুক্তিই হলো প্রোগ্রামিং লজিক।', icon: '🧠' },
    ],
    definition: {
      fullText: 'Programming Logic (প্রোগ্রামিং লজিক) হলো শর্ত (Condition) যাচাই করার একটি পদ্ধতি। কোনো শর্ত যদি সত্য (True) হয়, তাহলে একটি কাজ করে; আর যদি মিথ্যা (False) হয়, তাহলে অন্য একটি কাজ করে। উদাহরণ: "if Score > 50 then You Win! else Try Again!"। এটাই প্রোগ্রামিংয়ের মূল ভিত্তি। টিপস: শর্তের মধ্যে তুলনা (>, <, =) ব্যবহার করো। ভুল শর্ত লিখলে প্রোগ্রাম ভুল সিদ্ধান্ত নেবে, তাই শর্ত ভালো করে ভাবো।',
    },
    recipeComparison: {
      text: 'ট্রাফিক সিগন্যাল আর প্রোগ্রামিং লজিক একই: লাল বাতিতে থামা আর সবুজ বাতিতে যাওয়া — ঠিক যেমন "if লাল then থামাও else চালাও"। শর্ত পূরণ হলে এক কাজ, নাহলে অন্য।',
    },
    challenge: {
      task: 'একটি ট্রাফিক সিগন্যালের লজিক তৈরি করো: "if বাতি লাল then গাড়ি থামাও else গাড়ি চালাও"। টিপস: Score > 50-এর মতো শর্ত ব্লক ব্যবহার করে লাল/সবুজ পরীক্ষা করো।',
    },
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
  short: {
    storySteps: [
      { id: 1, text: '১ থেকে ১০০ লিখতে একইভাবে বারবার লিখতে হয়।', icon: '📝' },
      { id: 2, text: 'একই কাজ বারবার করাই হলো লুপ।', icon: '🔁' },
      { id: 3, text: 'লুপে কোড কম লিখতে হয়।', icon: '💾' },
    ],
    definition: {
      fullText: 'Loop (লুপ) হলো একই কাজ বারবার করার নির্দেশ। "repeat 10" দিলে ভেতরের কাজ ১০ বার হয়, "forever" দিলে চলতেই থাকে।',
    },
    recipeComparison: {
      text: 'গানের রিফ্রেইন = লুপ। একই সুর বারবার — আলাদা লেখার দরকার নেই।',
    },
    challenge: {
      task: 'স্প্রাইটকে বাম থেকে ডানে চিরকাল হাঁটানোর লুপ লিখো।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: '১ থেকে ১০০ লিখতে হলে একই পদ্ধতিতে বারবার লিখতে হয়।', icon: '📝' },
      { id: 2, text: 'তুমি একই কলমে ১, ২, ৩ করে যাচ্ছ — এটি পুনরাবৃত্তি।', icon: '✍️' },
      { id: 3, text: 'প্রোগ্রামেও একই কাজ বারবার লিখলে কোড বড় হয়।', icon: '⌨️' },
      { id: 4, text: '"repeat" বা "forever" ব্লক দিলে ভেতরের কাজ বারবার হয়।', icon: '🔁' },
      { id: 5, text: 'লুপ ব্যবহারে কোড ছোট, দ্রুত ও কম ভুল হয়।', icon: '✅' },
    ],
    definition: {
      fullText: 'লুপ (Loop) হলো প্রোগ্রামিংয়ের একটি শক্তিশালী কাঠামো যা একটি মাত্র নির্দেশ বা নির্দেশসমূহকে বারবার পুনরাবৃত্তি করতে দেয়। মূলত দুই ধরনের লুপ: "repeat N" — নির্দিষ্ট সংখ্যক বার (যেমন ১০ বার Jump), আর "forever" — শেষ না হওয়া পর্যন্ত চলতেই থাকে। উদাহরণ: "repeat 10" এর ভেতর "move 10 steps" দিলে স্প্রাইট ১০ বার লাফাবে, অথচ কোড একবারই লিখেছো। টিপস: লুপের ভেতরে ভিন্ন কাজও রাখতে পারো (যেমন ঘোরা + স্বর)। "forever" লুপ স্টেজে সবসময় চলতে থাকে, তাই প্রয়োজনে "repeat" ব্যবহার করো।',
    },
    recipeComparison: {
      text: 'গানের রিফ্রেইন আর লুপ একই: দুটিই একই অংশ বারবার দেয়। গানে রিফ্রেইন আলাদা লিখতে হয় না, ঠিক তেমনি লুপ প্রোগ্রামে একই কাজ বারবার লিখতে দেয় না। ফলে কোড ছোট ও পড়তে সহজ হয়।',
    },
    challenge: {
      task: 'একটি স্প্রাইটকে স্ক্রিনের বাম থেকে ডানে আজীবন হাঁটাতে হবে: "when Green Flag → forever → move 10 steps → if on edge, bounce"। টিপস: "forever" লুপের ভেতর "move" ও "if on edge, bounce" রাখলে স্প্রাইট দেওয়ালে ঠেকলে ফিরে আসবে।',
    },
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
    task: 'দুধ চা বানানোর একটি অ্যালগরিদম লিখো।',
    steps: [
      { id: 'c-1', text: 'দুধ গরম করো' },
      { id: 'c-2', text: 'চা পাতা দাও' },
      { id: 'c-3', text: 'চিনি মেশাও' },
      { id: 'c-4', text: 'পরিবেশন করো' },
    ],
  },
  short: {
    storySteps: [
      { id: 1, text: 'রিমোটের বাটন চাপলে টিভি অন হয়।', icon: '📺' },
      { id: 2, text: 'Scratch-এ ঘটনা (Event) প্রোগ্রাম শুরু করে।', icon: '🟢' },
      { id: 3, text: 'এই ট্রিগারই হলো Event Block।', icon: '⚡' },
    ],
    definition: {
      fullText: 'Event (ঘটনা) হলো প্রোগ্রামের ট্রিগার — যেমন Green Flag ক্লিক করলে কাজ শুরু। Scratch-এ "When Green Flag Clicked" ব্লক একটি Event Block।',
    },
    recipeComparison: {
      text: 'রিমোট বাটন = Green Flag। চাপলেই কাজ শুরু — এটিই Event।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'তুমি টিভির রিমোটের বাটন চাপলে টিভি অন হয় — তুমি কিছু না করলে তা নিজে চলে না।', icon: '📺' },
      { id: 2, text: 'Scratch-এও এমনি একটি "ঘটনা" দরকার যা প্রোগ্রাম শুরু করবে।', icon: '🟢' },
      { id: 3, text: '"When Green Flag Clicked" হলো একটি Hat Block বা Event Block — এর নিচে যা থাকে তা তখনই চলে।', icon: '⚡' },
      { id: 4, text: 'এছাড়া "When Space Key Pressed", "When Sprite Clicked" — এগুলোও Event Block।', icon: '⌨️' },
      { id: 5, text: 'ঘটনার ওপর ভিত্তি করেই গেম বা অ্যানিমেশন সাড়া দেয়।', icon: '🎮' },
    ],
    definition: {
      fullText: 'Event (ইভেন্ট) হলো প্রোগ্রামিংয়ের একটি বিশেষ ঘটনা যা প্রোগ্রামকে বলে দেয় কখন এবং কীভাবে কাজ শুরু করতে হবে। সবচেয়ে বেশি ব্যবহৃত Event Block হলো "When Green Flag Clicked" — এর নিচে থাকা ব্লকগুলো ধারাবাহিকভাবে কানেক্ট হয়ে চলে। এছাড়া "When Space Key Pressed", "When Sprite Clicked" ইত্যাদিও Event Block। টিপস: একাধিক Event Block ব্যবহার করে তুমি একসাথে অনেক কাজ চালাতে পারো (যেমন এক বাটনে চলা, আরেকটিতে শব্দ)। Event ছাড়া প্রোগ্রাম নিজে থেকে শুরু হয় না।',
    },
    recipeComparison: {
      text: 'রিমোটের বাটন আর Green Flag একই কাজ করে: চাপলেই কাজ শুরু। টিভির রিমোট ছাড়া টিভি অন হয় না, ঠিক তেমনি Green Flag ছাড়া Scratch প্রোগ্রাম নিজে চলে না। তাই Event-কে প্রোগ্রামের "চাবি" ভাবতে পারো।',
    },
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
  short: {
    storySteps: [
      { id: 1, text: 'পরীক্ষার খাতায় গ্রেড নির্ভর করে ফল।', icon: '📝' },
      { id: 2, text: 'শর্ত সত্য হলে এক কাজ, মিথ্যা হলে অন্য।', icon: '⚖️' },
      { id: 3, text: 'এটিই If-Else সিদ্ধান্ত।', icon: '🔀' },
    ],
    definition: {
      fullText: 'If-Else হলো সিদ্ধান্তের কাঠামো: শর্ত সত্য (True) হলে এক ব্লক, মিথ্যা (False) হলে অন্য ব্লক চলে।',
    },
    recipeComparison: {
      text: 'পরীক্ষায় পাস/ফেল = If-Else। শর্ত পূরণ হলে পুরস্কার, নাহলে পড়াশোনা।',
    },
    challenge: {
      task: 'পাসওয়ার্ড "1234" হলে স্বাগতম, নাহলে ভুল বার্তা — লজিক লিখো।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'তুমি পরীক্ষার খাতা হাতে পেয়েছ — নম্বর দেখে গ্রেড ঠিক হয়।', icon: '📝' },
      { id: 2, text: 'যদি ৮০ বা বেশি পাও, তবে A+; নাহলে সাধারণ গ্রেড।', icon: '🎯' },
      { id: 3, text: 'এখানে দুটি পথ — শর্ত সত্যি নাকি মিথ্যা।', icon: '⚖️' },
      { id: 4, text: 'প্রোগ্রামে "if" দিয়ে শর্ত, "else" দিয়ে বিকল্প পথ দেখানো হয়।', icon: '🔀' },
      { id: 5, text: 'এভাবেই গেম বা অ্যাপ সিদ্ধান্ত নেয়।', icon: '🎮' },
    ],
    definition: {
      fullText: 'If-Else হলো প্রোগ্রামিংয়ের একটি সিদ্ধান্ত গ্রহণের কাঠামো। একটি শর্ত (Condition) পরীক্ষা করা হয় — শর্তটি যদি সত্য (True) হয় তবে "if" ব্লক চলে, আর যদি মিথ্যা (False) হয় তবে "else" ব্লক চলে। উদাহরণ: "if Score >= 50 then say পাস! else say ফেল!"। টিপস: শর্তের মধ্যে তুলনা (>, <, =) বা সমতা ব্যবহার করো। একাধিক শর্ত দরকার হলে "else if" যোগ করতে পারো। ভুল শর্ত লিখলে প্রোগ্রাম ভুল সিদ্ধান্ত নেবে।',
    },
    recipeComparison: {
      text: 'পরীক্ষায় পাস/ফেল আর If-Else একই: দুটিই শর্তের ওপর ভিত্তি করে ফল ঠিক করে। শর্ত পূরণ হলে পুরস্কার, নাহলে বিকল্প ব্যবস্থা — ঠিক যেমন "if পাস then পুরস্কার else পড়াশোনা"।',
    },
    challenge: {
      task: 'একটি পাসওয়ার্ড চেকিং সিস্টেমের লজিক তৈরি করো: "if Password = 1234 then say স্বাগতম! else say ভুল পাসওয়ার্ড!"। টিপস: আগে একটি ভেরিয়েবল Password তৈরি করে মান সেট করো, তারপর if-else দিয়ে চেক করো।',
    },
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
  short: {
    storySteps: [
      { id: 1, text: 'ক্রিকেটের স্কোরবোর্ডে সংখ্যা বদলায়।', icon: '🏏' },
      { id: 2, text: 'প্রোগ্রামেও তথ্য রাখার বাক্স থাকে।', icon: '📦' },
      { id: 3, text: 'এই বাক্সই হলো ভেরিয়েবল।', icon: '🏷️' },
    ],
    definition: {
      fullText: 'Variable (ভেরিয়েবল) হলো মেমোরিতে তথ্য রাখার নামকরা জায়গা। নাম একই থাকে, মান বদলানো যায় (যেমন Score = 0 → 1)।',
    },
    recipeComparison: {
      text: 'লেবেল লাগানো বাক্স = ভেরিয়েবল। ভেতরের জিনিস বদলালেও বাক্সের নাম একই।',
    },
    challenge: {
      task: 'গেমের জন্য Life ভেরিয়েবল তৈরি করো (set Life to 3)।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'ক্রিকেট দেখার সময় স্ক্রিনে স্কোর দেখো — প্রতি বলে তা বদলায়।', icon: '🏏' },
      { id: 2, text: 'এই যে রান রাখার জায়গা যা বারবার বদলায়, তাকে বলে ভেরিয়েবল।', icon: '📊' },
      { id: 3, text: 'প্রোগ্রামে একে একটি লেবেল লাগানো বাক্স ভাবো।', icon: '📦' },
      { id: 4, text: 'বাক্সের নাম (যেমন Score) সবসময় একই, কিন্তু ভেতরের সংখ্যা বদলায়।', icon: '🏷️' },
      { id: 5, text: 'গেমের Life, দোকানের মোট দাম — সবই ভেরিয়েবল দিয়ে রাখা হয়।', icon: '🎮' },
    ],
    definition: {
      fullText: 'Variable (ভেরিয়েবল) হলো কম্পিউটার মেমোরিতে তথ্য সংরক্ষণের একটি নামকরা জায়গা। এর একটি নাম (Name) ও একটি মান (Value) থাকে। প্রোগ্রাম চলাকালে মানটি বদলানো যায়, কিন্তু নামটি একই থাকে — যেমন Score = 0 থেকে Score = 1। ভেরিয়েবলে সংখ্যা, লেখা বা সত্য/মিথ্যা সব রাখা যায়। টিপস: "Make a Variable" দিয়ে তৈরি করো, "set" দিয়ে মান দাও, আর "change" দিয়ে বাড়াও-কমাও। গেমে Life কমাতে "change Life by -1" ব্যবহার করো; Life = 0 হলে Game Over।',
    },
    recipeComparison: {
      text: 'লেবেল লাগানো বাক্স আর ভেরিয়েবল একই: বাক্সের গায়ে নাম লেখা থাকে, ভেতরে যেকোনো জিনিস রাখা যায় ও বদলানো যায়। স্কোরবোর্ডের মতো ভেরিয়েবলও সময়ে সময়ে হালনাগাদ হয়, কিন্তু "স্কোর" নামটি একই থাকে।',
    },
    challenge: {
      task: 'একটি গেমের জন্য Life নামের একটি ভেরিয়েবল তৈরি করো: "Make a Variable" → নাম Life → "set Life to 3"। যখন বিড়াল বাধায় পড়বে তখন "change Life by -1" করো এবং Life = 0 হলে "Game Over" দেখাও।',
    },
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
  short: {
    definition: {
      fullText: 'Operators হলো গাণিতিক (+, -, ×, ÷) ও তুলনামূলক (>, <, =) চিহ্ন যা দিয়ে সংখ্যা নিয়ে কাজ করা যায়।',
    },
    recipeComparison: {
      text: 'মুদির দোকানের হিসাব = অপারেটর। যোগ-বিয়োগ করে মোট মূল্য বার করে।',
    },
    challenge: {
      task: 'Num1 ও Num2 গুণ করার ক্যালকুলেটর কোড সাজাও।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'মুদির দোকানে কেনাকাটার পর মোট দাম বার করতে হয়।', icon: '🛒' },
      { id: 2, text: 'যোগ, বিয়োগ, গুণ, ভাগ — এগুলোই গাণিতিক অপারেটর।', icon: '➕' },
      { id: 3, text: 'কোনটি বড় বা সমান তা জানতে তুলনা অপারেটর (>, <, =) লাগে।', icon: '⚖️' },
      { id: 4, text: 'Scratch-এ Operators ব্লক দিয়ে সংখ্যা ও শর্ত নিয়ে কাজ করা যায়।', icon: '🔢' },
      { id: 5, text: 'এরাই প্রোগ্রামের হিসাব ও সিদ্ধান্তের ভিত্তি।', icon: '🧮' },
    ],
    definition: {
      fullText: 'Operators (অপারেটর) হলো প্রোগ্রামিংয়ের এমন চিহ্ন যা দিয়ে গাণিতিক কাজ (যোগ +, বিয়োগ -, গুণ ×, ভাগ ÷) এবং তুলনা (>, <, =) করা যায়। গাণিতিক অপারেটর দিয়ে সংখ্যা বাড়ানো-কমানো যায়, আর তুলনামূলক অপারেটর if-এর শর্ত তৈরি করতে কাজে লাগে (যেমন Score > 50)। Scratch-এ "Operators" প্যালেটে এই ব্লকগুলো থাকে। টিপস: গুণ করতে "Num1 × Num2" ব্লক ব্যবহার করো; ফল একটি ভেরিয়েবলে রেখে দেখাতে পারো।',
    },
    recipeComparison: {
      text: 'মুদির দোকানের হিসাব আর অপারেটর একই: দোকানি যোগ-বিয়োগ করে মোট মূল্য বার করে, ঠিক যেমন প্রোগ্রাম অপারেটর দিয়ে সংখ্যা নিয়ে কাজ করে।',
    },
    challenge: {
      task: 'একটি ক্যালকুলেটরের কোড ডিজাইন করো যা দুটি ভেরিয়েবল Num1 এবং Num2 কে গুণ করবে: "Make a Variable Result" → "set Result to (Num1 × Num2)" → "say Result"। চাইলে যোগ/বিয়োগের জন্য আলাদা ব্লকও যোগ করতে পারো।',
    },
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
  short: {
    definition: {
      fullText: 'Sensing হলো স্প্রাইটের ইন্দ্রিয় — সে বুঝতে পারে কিছু ছুঁয়েছে কি না, বা মাউস/কীবোর্ডে ইনপুট এসেছে কি না।',
    },
    recipeComparison: {
      text: 'চোখ-কান = সেন্সিং। কিছু ছুঁলে বা শব্দ হলে আমরা বুঝি, স্প্রাইটও তাই।',
    },
    challenge: {
      task: 'মাউস স্প্রাইটের ওপর গেলে "ছুঁয়েছ!" বলানোর সেন্সিং লজিক লিখো।',
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'তুমি যখন কিছু ছুঁয়ে বুঝতে পারো, তখন তোমার স্পর্শ ইন্দ্রিয় কাজ করে।', icon: '✋' },
      { id: 2, text: 'স্প্রাইটও বুঝতে পারে সে অন্য কোনো স্প্রাইট বা মাউসকে ছুঁয়েছে কি না।', icon: '🖱️' },
      { id: 3, text: '"touching mouse-pointer?" বা "touching [sprite]?" ব্লক এই কাজ করে।', icon: '👁️' },
      { id: 4, text: 'মাউস বা কীবোর্ডের ইনপুটও সেন্সিং দিয়ে ধরা যায়।', icon: '⌨️' },
      { id: 5, text: 'এতে গেম ইন্টারেক্টিভ হয় — খেলোয়াড়ের কাজে স্প্রাইট সাড়া দেয়।', icon: '🎮' },
    ],
    definition: {
      fullText: 'Sensing (সেন্সিং) হলো এমন একটি ব্যবস্থা যার মাধ্যমে স্প্রাইট বুঝতে পারে সে কোন কিছু ছুঁয়েছে কিনা, কিংবা Mouse বা Keyboard এ কোন ইনপুট দেওয়া হয়েছে কিনা। Scratch-এ "Sensing" প্যালেটে "touching [sprite]?", "touching color ?", "mouse x", "mouse y", "key [space] pressed?" ইত্যাদি ব্লক থাকে। এগুলো if-এর সাথে ব্যবহার করলে স্প্রাইট পরিবেশের সাড়া দেয়। টিপস: "if touching mouse-pointer? then say ছুঁয়েছ!" দিয়ে সহজে টাচ ডিটেক্ট করা যায়। সেন্সিং ছাড়া গেমে খেলোয়াড়ের সাথে যোগাযোগ হয় না।',
    },
    recipeComparison: {
      text: 'আমাদের চোখ-কান-স্পর্শ আর সেন্সিং একই: আমরা কিছু ছুঁলে বা শব্দ শুনলে বুঝি, ঠিক তেমনি স্প্রাইট সেন্সিং ব্লক দিয়ে চারপাশ বুঝতে পারে।',
    },
    challenge: {
      task: 'মাউসের কার্সার স্প্রাইটের উপর নিয়ে গেলে স্প্রাইটটি বলবে "তুমি আমাকে ছুঁয়েছ!": "if touching mouse-pointer? then say তুমি আমাকে ছুঁয়েছ! for 1 seconds"। চাইলে "forever" লুপের ভেতর রাখলে বারবার চেক করবে।',
    },
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
  short: {
    definition: {
      fullText: 'Background (Backdrop) হলো স্টেজের পেছনের ছবি, আর Sound হলো তার সাথের অডিও। দুটি মিলিয়ে প্রোগ্রাম জীবন্ত করে।',
    },
    recipeComparison: {
      text: 'সিনেমার সেট ও সাউন্ডট্র্যাক = ব্যাকগ্রাউন্ড ও সাউন্ড।',
    },
    challenge: {
      task: "'S' চাপলে পাখির ডাক ও জঙ্গল ব্যাকড্রপ দেখানোর লজিক লিখো।",
    },
  },
  long: {
    storySteps: [
      { id: 1, text: 'সিনেমা দেখার সময় পেছনের সেট ও সাউন্ড মিলে দৃশ্য জীবন্ত করে।', icon: '🎬' },
      { id: 2, text: 'Scratch-এ স্টেজের পেছনের ছবি হলো Backdrop বা Background।', icon: '🖼️' },
      { id: 3, text: 'সাথে যোগ করা যায় Sound — যেমন পাখির ডাক বা মিউজিক।', icon: '🔊' },
      { id: 4, text: '"switch backdrop to [jungle]" বা "play sound [chirp]" ব্লক দিয়ে এগুলো নিয়ন্ত্রণ করো।', icon: '🎛️' },
      { id: 5, text: 'সঠিক ব্যাকগ্রাউন্ড ও সাউন্ড প্রোজেক্টকে আকর্ষণীয় করে।', icon: '✨' },
    ],
    definition: {
      fullText: 'Scratch-এ Background বা Backdrop হলো স্টেজের পেছনের দৃশ্য (যেমন বন, মাঠ, ঘর), এবং Sound হলো সেই দৃশ্যের সাথে মিল রেখে বাজানো অডিও বা মিউজিক। "switch backdrop to [name]" ব্লক দিয়ে ব্যাকগ্রাউন্ড বদলানো যায়, আর "play sound [name]" বা "play sound [name] until done" দিয়ে শব্দ বাজানো যায়। সঠিক Backdrop ও Sound ব্যবহার করে প্রোগ্রামকে আরও জীবন্ত ও আকর্ষণীয় করা যায়। টিপস: ইভেন্ট ব্লকের সাথে সাউন্ড জুড়ে দাও (যেমন "when S key pressed → switch backdrop to jungle → play sound chirp")।',
    },
    recipeComparison: {
      text: 'সিনেমার সেট ও সাউন্ডট্র্যাক আর ব্যাকগ্রাউন্ড ও সাউন্ড একই: দুটিই দৃশ্যকে বাস্তব ও জীবন্ত করে তোলে।',
    },
    challenge: {
      task: 'কীবোর্ডের \'S\' বাটন চাপলে বনের পাখির ডাক শোনা যাবে এবং ব্যাকগ্রাউন্ডে একটি জঙ্গল দেখা যাবে: "when S key pressed → switch backdrop to jungle → play sound chirp"। চাইলে সাউন্ড শেষ না হওয়া পর্যন্ত অপেক্ষা করতে "play sound until done" ব্যবহার করো।',
    },
  },
};

// Resolve the content for the requested reading mode. Reuses the single
// `LessonData` shape, so no lesson component needs to change — the page just
// passes a different `data` object to the same renderer. Short/Long overrides
// are deep-merged over the base (Medium) content, so each mode only needs to
// specify the fields that differ. If a mode has no authored content, we fall
// back to the base lesson so a placeholder is never displayed.
function mergeLesson(base: LessonData, override: LessonContent): LessonData {
  const result: LessonData = { ...base };
  for (const key of Object.keys(override) as (keyof LessonContent)[]) {
    const ov = (override as unknown as Record<string, unknown>)[key as string];
    const bv = (base as unknown as Record<string, unknown>)[key as string];
    const bothObjects =
      ov && typeof ov === 'object' && !Array.isArray(ov) &&
      bv && typeof bv === 'object' && !Array.isArray(bv);
    (result as unknown as Record<string, unknown>)[key as string] = bothObjects
      ? { ...bv, ...ov }
      : ov;
  }
  return result;
}
