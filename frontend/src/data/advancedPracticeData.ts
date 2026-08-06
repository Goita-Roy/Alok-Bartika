export type PracticeDifficulty = 'Easy' | 'Medium' | 'Hard';

export type PracticeStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface Practice {
  id: string;
  classNumber: number;
  practiceNumber: number;
  title: string;
  difficulty: PracticeDifficulty;
  xp: number;
  estimatedTime: number;
  problemStatement: string;
  input: string;
  output: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  starterCode: string;
  expectedOutput: string;
}

export interface PracticeClass {
  id: string;
  classNumber: number;
  title: string;
  language: string;
  practices: Practice[];
}

export const class1Practices: Practice[] = [
  {
    id: 'class-1-practice-1',
    classNumber: 1,
    practiceNumber: 1,
    title: 'প্রথম প্রোগ্রাম — Hello World',
    difficulty: 'Easy',
    xp: 50,
    estimatedTime: 5,
    problemStatement:
      'পাইথন ভাষায় একটি সহজ প্রোগ্রাম লিখুন যা "Hello, Alokbartika!" বার্তাটি প্রিন্ট করবে।\n\nprint() ফাংশনটি স্ক্রিনে টেক্সট বা মান প্রদর্শন করে। এটি পাইথনের সবচেয়ে মৌলিক ও গুরুত্বপূর্ণ ফাংশন।\n\nনির্দেশনা:\n- print() ফাংশনটি ব্যবহার করুন\n- স্ট্রিংটি ঠিক মতোই কোটেশন চিহ্নের মধ্যে লিখুন\n- অতিরিক্ত স্পেস বা লাইন যোগ করবেন না',
    input: 'কোন ইনপুট প্রয়োজন নেই।',
    output: 'কনসোলে "Hello, Alokbartika!" প্রিন্ট করতে হবে।',
    constraints: [
      'print() ফাংশনটি ব্যবহার করুন।',
      'আউটপুটটি ঠিক মতো হওয়া আবশ্যক: "Hello, Alokbartika!"',
      'কোন অতিরিক্ত আউটপুট থাকা যাবে না।',
    ],
    sampleInput: 'N/A',
    sampleOutput: 'Hello, Alokbartika!',
    starterCode: '# Practice 1: প্রথম প্রোগ্রাম\n# "Hello, Alokbartika!" প্রিন্ট করুন\n\nprint("")\n',
    expectedOutput: 'Hello, Alokbartika!',
  },
  {
    id: 'class-1-practice-2',
    classNumber: 1,
    practiceNumber: 2,
    title: 'ফর্ম্যাটেড আউটপুট নিয়ে প্রশ্ন',
    difficulty: 'Medium',
    xp: 100,
    estimatedTime: 10,
    problemStatement:
      'পাইথন প্রোগ্রাম লিখুন যা নিম্নোক্ত তিনটি আলাদা লাইনে আউটপুট প্রদর্শন করবে:\n\n১. একজন ছাত্রের নাম এবং বয়স প্রিন্ট করুন।\n২. একই লাইনে একজন ব্যক্তির নাম এবং পছন্দের রঙ প্রিন্ট করুন।\n৩. f-স্ট্রিং ব্যবহার করে একটি স্বাগত বার্তা প্রিন্ট করুন।\n\nনির্দেশনা:\n- print() ফাংশনটি ব্যবহার করুন\n- একাধিক print() স্ট্যাটমেন্ট ব্যবহার করুন\n- f-স্ট্রিং (formatted string) ব্যবহার করুন যখন প্রয়োজন\n- প্রতিটি আউটপুট সঠিকভাবে ফর্ম্যাট করুন',
    input: 'কোন ইনপুট প্রয়োজন নেই।',
    output: 'তিনটি লাইনে আলাদাআলাদা আউটপুট প্রদর্শন করতে হবে:\n\nStudent: Riya, Age: 12\nFavorite color: Blue\nWelcome to Alokbartika, Riya!',
    constraints: [
      'প্রতিটি print() স্ট্যাটমেন্ট আলাদা লাইনে আউটপুট দেবে।',
      'f-স্ট্রিং ব্যবহার করে ভেরিয়েবলের মান ইন্টারপোলেট করুন।',
      'আউটপুটের ফর্ম্যাট ঠিক রাখুন।',
    ],
    sampleInput: 'N/A',
    sampleOutput:
      'Student: Riya, Age: 12\nFavorite color: Blue\nWelcome to Alokbartika, Riya!',
    starterCode:
      '# Practice 2: ফর্ম্যাটেড আউটপুট\n# নিচের তিনটি আউটপুট প্রদর্শন করুন:\n# 1. "Student: Riya, Age: 12"\n# 2. "Favorite color: Blue"\n# 3. f-স্ট্রিং ব্যবহার করে "Welcome to Alokbartika, Riya!"\n\nname = "Riya"\nage = 12\ncolor = "Blue"\n\nprint()\nprint()\nprint()\n',
    expectedOutput:
      'Student: Riya, Age: 12\nFavorite color: Blue\nWelcome to Alokbartika, Riya!',
  },
  {
    id: 'class-1-practice-3',
    classNumber: 1,
    practiceNumber: 3,
    title: 'বহু-লাইন ব্যানার সৃষ্টি',
    difficulty: 'Hard',
    xp: 200,
    estimatedTime: 20,
    problemStatement:
      'একটি সৌন্দর্য্যময় ব্যানার প্রিন্ট করতে একটি পাইথন প্রোগ্রাম লিখুন যা ঠিক নিচের মতো দেখায়:\n\n```\n╔══════════════════════════════╗\n║    আলোকবর্তিকা কোডিং    ║\n║     Welcome, Young Coder!      ║\n╚══════════════════════════════╝\n```\n\nনির্দেশনা:\n- বহু-লাইন স্ট্রিং (triple-quoted string) ব্যবহার করুন\n- ঠিক মতো স্পেস এবং বর্ডার ব্যবহার করুন\n- f-স্ট্রিং ব্যবহার করে ডাইনামিক ভ্যালু রাখুন\n- আউটপুটটি ঠিক মতো সংরেখণ করুন',
    input: 'কোন ইনপুট প্রয়োজন নেই।',
    output: 'নিম্নোক্ত ব্যানারটি প্রিন্ট করতে হবে সঠিক স্পেস এবং সংরেখণ সহ:\n\n╔══════════════════════════════╗\n║    আলোকবর্তিকা কোডিং    ║\n║     Welcome, Young Coder!      ║\n╚══════════════════════════════╝',
    constraints: [
      'বহু-লাইন স্ট্রিং ব্যবহার করুন।',
      'স্পেস এবং বর্ডার ঠিক রাখুন।',
      'প্রতিটি লাইন ঠিক মতো সংরেখণ করুন।',
      'অতিরিক্ত লাইন বা স্পেস যোগ করবেন না।',
    ],
    sampleInput: 'N/A',
    sampleOutput:
      '╔══════════════════════════════╗\n║    আলোকবর্তিকা কোডিং    ║\n║     Welcome, Young Coder!      ║\n╚══════════════════════════════╝',
    starterCode:
      '# Practice 3: বহু-লাইন ব্যানার\n# নিচের ব্যানারটি প্রিন্ট করুন:\n#\n# ╔══════════════════════════════╗\n# ║    আলোকবর্তিকা কোডিং    ║\n# ║     Welcome, Young Coder!      ║\n# ╚══════════════════════════════╝\n\nprint("""\n╔══════════════════════════════╗\n║    আলোকবর্তিকা কোডিং    ║\n║     Welcome, Young Coder!      ║\n╚══════════════════════════════╝\n""")\n',
    expectedOutput:
      '╔══════════════════════════════╗\n║    আলোকবর্তিকা কোডিং    ║\n║     Welcome, Young Coder!      ║\n╚══════════════════════════════╝',
  },
];

export const class1PracticeClass: PracticeClass = {
  id: 'class-1-python-basics',
  classNumber: 1,
  title: 'পাইথন বেসিক্স — আপনার প্রথম প্রোগ্রাম',
  language: 'python',
  practices: class1Practices,
};

export const DIFFICULTY_COLORS: Record<PracticeDifficulty, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  Hard: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

export const STATUS_ICONS: Record<PracticeStatus, string> = {
  locked: '🔒',
  available: '▶',
  'in-progress': '⏳',
  completed: '✓',
};

export const STATUS_COLORS: Record<PracticeStatus, string> = {
  locked: 'text-slate-500',
  available: 'text-violet-400',
  'in-progress': 'text-amber-400',
  completed: 'text-emerald-400',
};

export function getPracticeById(id: string): Practice | undefined {
  return class1Practices.find((p) => p.id === id);
}