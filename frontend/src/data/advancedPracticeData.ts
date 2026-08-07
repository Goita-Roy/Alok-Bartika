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
  {
    id: 'class-1-practice-4',
    classNumber: 1,
    practiceNumber: 4,
    title: 'Print Your Name',
    difficulty: 'Easy',
    xp: 50,
    estimatedTime: 5,
    problemStatement:
      'Write a Python program that prints your name on the screen.\n\nSample Output:\nRahim',
    input: 'No input required.',
    output: 'Print your name on the console.',
    constraints: [
      'Use the print() function.',
      'Write your name inside quotation marks.',
      'No extra spaces or lines.',
    ],
    sampleInput: 'N/A',
    sampleOutput: 'Rahim',
    starterCode: '# Practice 4: Print Your Name\n# Print your name on the screen\n\nprint("")\n',
    expectedOutput: 'Rahim',
  },
  {
    id: 'class-1-practice-5',
    classNumber: 1,
    practiceNumber: 5,
    title: 'Student Introduction',
    difficulty: 'Medium',
    xp: 100,
    estimatedTime: 10,
    problemStatement:
      'Write a Python program to print the following information on separate lines:\n- Your name\n- Your class\n- Your favorite subject\n\nSample Output:\nName: Rahim\nClass: 7\nFavorite Subject: Science',
    input: 'No input required.',
    output: 'Print name, class, and favorite subject on separate lines.',
    constraints: [
      'Use print() function for each line.',
      'Format each line as shown in sample output.',
      'Use f-strings or string concatenation.',
    ],
    sampleInput: 'N/A',
    sampleOutput: 'Name: Rahim\nClass: 7\nFavorite Subject: Science',
    starterCode: '# Practice 5: Student Introduction\n# Print your information on separate lines\n\nname = ""\nclass_ = ""\nsubject = ""\n\nprint()\nprint()\nprint()\n',
    expectedOutput: 'Name: Rahim\nClass: 7\nFavorite Subject: Science',
  },
  {
    id: 'class-1-practice-6',
    classNumber: 1,
    practiceNumber: 6,
    title: 'Welcome Banner',
    difficulty: 'Hard',
    xp: 200,
    estimatedTime: 20,
    problemStatement:
      'Write a Python program to print the following output exactly as shown below.\n\nSample Output:\n********************\n Welcome to Python!\n Let\'s Start Coding!\n********************',
    input: 'No input required.',
    output: 'Print the welcome banner exactly as shown.',
    constraints: [
      'Use a multi-line string (triple-quoted string).',
      'Match the exact spacing and asterisks.',
      'The banner should be exactly 20 asterisks wide.',
    ],
    sampleInput: 'N/A',
    sampleOutput: '********************\n Welcome to Python!\n Let\'s Start Coding!\n********************',
    starterCode: '# Practice 6: Welcome Banner\n# Print the welcome banner exactly as shown\n\nprint("""\n********************\n Welcome to Python!\n Let\'s Start Coding!\n********************\n""")\n',
    expectedOutput: '********************\n Welcome to Python!\n Let\'s Start Coding!\n********************',
  },
];
 
export const class2Practices: Practice[] = [
  {
    id: 'class-2-practice-1',
    classNumber: 2,
    practiceNumber: 1,
    title: 'Store and Print a Name',
    difficulty: 'Easy',
    xp: 50,
    estimatedTime: 5,
    problemStatement:
      'Create a variable named `name` and store your name in it. Then print the value of the variable.\n\nSample Output:\nRahim',
    input: 'No input required.',
    output: 'Print the value of the name variable.',
    constraints: [
      'Create a variable named name.',
      'Store your name as a string.',
      'Use print() to display the variable.',
    ],
    sampleInput: 'N/A',
    sampleOutput: 'Rahim',
    starterCode: '# Practice 1: Store and Print a Name\n# Create a variable and print it\n\nname = ""\nprint(name)\n',
    expectedOutput: 'Rahim',
  },
  {
    id: 'class-2-practice-2',
    classNumber: 2,
    practiceNumber: 2,
    title: 'Student Information',
    difficulty: 'Medium',
    xp: 100,
    estimatedTime: 10,
    problemStatement:
      'Create the following variables:\n- `name`\n- `age`\n- `school`\n\nAssign appropriate values to each variable and print them on separate lines.\n\nSample Output:\nName: Rahim\nAge: 13\nSchool: ABC High School',
    input: 'No input required.',
    output: 'Print name, age, and school on separate lines.',
    constraints: [
      'Create three variables: name, age, school.',
      'Use f-strings or string concatenation for formatted output.',
      'Each piece of information on a separate line.',
    ],
    sampleInput: 'N/A',
    sampleOutput: 'Name: Rahim\nAge: 13\nSchool: ABC High School',
    starterCode: '# Practice 2: Student Information\n# Create variables and print formatted output\n\nname = ""\nage = 0\nschool = ""\n\nprint()\nprint()\nprint()\n',
    expectedOutput: 'Name: Rahim\nAge: 13\nSchool: ABC High School',
  },
  {
    id: 'class-2-practice-3',
    classNumber: 2,
    practiceNumber: 3,
    title: 'Add Two Numbers Using Variables',
    difficulty: 'Hard',
    xp: 200,
    estimatedTime: 20,
    problemStatement:
      'Create two variables named `num1` and `num2`. Assign any two numbers to them. Create another variable named `sum` to store the addition of the two numbers. Finally, print the value of `sum`.\n\nSample Output:\nSum = 30',
    input: 'No input required.',
    output: 'Print the sum in the format: Sum = <value>',
    constraints: [
      'Create variables num1 and num2 with numeric values.',
      'Create a sum variable that adds num1 and num2.',
      'Print the result in the exact format shown.',
    ],
    sampleInput: 'N/A',
    sampleOutput: 'Sum = 30',
    starterCode: '# Practice 3: Add Two Numbers Using Variables\n# Add two numbers and print the sum\n\nnum1 = 0\nnum2 = 0\nsum = num1 + num2\n\nprint()\n',
    expectedOutput: 'Sum = 30',
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