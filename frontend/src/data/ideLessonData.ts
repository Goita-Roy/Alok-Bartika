export type SupportedLanguage = 'html' | 'css' | 'javascript' | 'python' | 'c' | 'cpp' | 'java'

export type IDELessonClass = {
  id: string
  classNumber: number
  heading: string
  language: SupportedLanguage
  objectives: string[]
  theory: string
  examples: { title: string; code: string; language?: SupportedLanguage }[]
  practiceQuestion: string
  codingTask: string
  instructions: string[]
  hints: string[]
  expectedOutput?: string
  starterFiles: { name: string; language: SupportedLanguage; content: string }[]
}

export const ideLessonClasses: IDELessonClass[] = [
  {
    id: 'class-1-python-basics',
    classNumber: 1,
    heading: 'Python Basics — Your First Program',
    language: 'python',
    objectives: [
      'Understand what print() does',
      'Write and run your first Python program',
      'Use variables to store simple values',
    ],
    theory:
      'Python is a beginner-friendly programming language. The print() function displays text or values on the screen. Variables let you store data like names and numbers for later use.',
    examples: [
      {
        title: 'Hello World',
        code: 'print("Hello, Alokbartika!")',
      },
      {
        title: 'Variables',
        code: 'name = "Riya"\nage = 12\nprint(name, age)',
      },
    ],
    practiceQuestion: 'What will be printed when you run print(2 + 3)?',
    codingTask: 'Write a program that prints your name and your favorite number.',
    instructions: [
      'Open main.py in the editor.',
      'Replace the starter code with your solution.',
      'Click Run Code and check the console output.',
      'Match the expected output format before marking complete.',
    ],
    hints: [
      'Use print() with quotes around text.',
      'You can print multiple items separated by commas.',
      'Example: print("My name is", name)',
    ],
    expectedOutput: 'Hello Student',
    starterFiles: [
      {
        name: 'main.py',
        language: 'python',
        content: '# Class 1: Print your name\nname = "Hello Student"\nprint(name)\n',
      },
    ],
  },
  {
    id: 'class-2-conditionals',
    classNumber: 2,
    heading: 'Conditionals — Even or Odd',
    language: 'python',
    objectives: [
      'Use if and else statements',
      'Compare values with == and %',
      'Make decisions in code',
    ],
    theory:
      'Conditional statements let your program choose different paths. The modulo operator (%) gives the remainder after division — useful for checking even or odd numbers.',
    examples: [
      {
        title: 'If / Else',
        code: 'num = 7\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
      },
    ],
    practiceQuestion: 'How do you check if a number is divisible by 5?',
    codingTask: 'Read a number and print whether it is Even or Odd.',
    instructions: [
      'Store a number in a variable.',
      'Use if num % 2 == 0 to test for even.',
      'Print "Even" or "Odd" accordingly.',
    ],
    hints: [
      'Don\'t forget the colon (:) after if and else.',
      'Indent the print lines inside if/else blocks.',
    ],
    expectedOutput: 'Even',
    starterFiles: [
      {
        name: 'main.py',
        language: 'python',
        content: 'num = 8\n# Write if/else below\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n',
      },
    ],
  },
  {
    id: 'class-3-loops',
    classNumber: 3,
    heading: 'Loops — Repeat with Confidence',
    language: 'python',
    objectives: [
      'Use for loops with range()',
      'Print sequences of numbers',
      'Understand loop iteration',
    ],
    theory:
      'A for loop repeats code a specific number of times. range(1, 11) generates numbers from 1 to 10. Loops are essential for tasks like tables, lists, and patterns.',
    examples: [
      {
        title: 'Count 1 to 5',
        code: 'for i in range(1, 6):\n    print(i)',
      },
      {
        title: 'Multiplication table of 2',
        code: 'for i in range(1, 11):\n    print(2 * i)',
      },
    ],
    practiceQuestion: 'What does range(0, 5) produce?',
    codingTask: 'Print numbers from 1 to 10, each on its own line.',
    instructions: [
      'Use for i in range(1, 11):',
      'Print i inside the loop body.',
      'Run and verify ten lines of output.',
    ],
    hints: [
      'range(1, 11) stops before 11.',
      'Indent the body of the for loop.',
    ],
    expectedOutput: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
    starterFiles: [
      {
        name: 'main.py',
        language: 'python',
        content: 'for i in range(1, 11):\n    print(i)\n',
      },
    ],
  },
  {
    id: 'class-4-html-css',
    classNumber: 4,
    heading: 'Web Foundations — HTML & CSS',
    language: 'html',
    objectives: [
      'Structure a simple web page with HTML',
      'Style elements using CSS',
      'Preview output in the browser panel',
    ],
    theory:
      'HTML defines structure (headings, paragraphs, buttons). CSS controls appearance (colors, spacing, fonts). Together they build every website you visit.',
    examples: [
      {
        title: 'Basic HTML',
        language: 'html',
        code: '<h1>Welcome</h1>\n<p>Learning web development!</p>',
      },
      {
        title: 'CSS styling',
        language: 'css',
        code: 'body { font-family: sans-serif; }\nh1 { color: #4f46e5; }',
      },
    ],
    practiceQuestion: 'Which tag is used for the largest heading?',
    codingTask: 'Create a page with a heading and a styled paragraph.',
    instructions: [
      'Edit index.html with your content.',
      'Add styles in style.css.',
      'Run Code to preview the page.',
    ],
    hints: [
      'Use <h1> for the main heading.',
      'Link CSS with <link rel="stylesheet" href="style.css"> in HTML.',
    ],
    starterFiles: [
      {
        name: 'index.html',
        language: 'html',
        content:
          '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Alokbartika Web</h1>\n  <p class="intro">I am learning HTML and CSS!</p>\n</body>\n</html>\n',
      },
      {
        name: 'style.css',
        language: 'css',
        content: 'body { font-family: system-ui; padding: 2rem; background: #f8fafc; }\nh1 { color: #4f46e5; }\n.intro { color: #334155; font-size: 1.1rem; }\n',
      },
    ],
  },
  {
    id: 'class-5-javascript',
    classNumber: 5,
    heading: 'JavaScript — Interactive Web Logic',
    language: 'javascript',
    objectives: [
      'Write JavaScript variables and functions',
      'Manipulate the DOM conceptually',
      'Understand client-side logic',
    ],
    theory:
      'JavaScript adds interactivity to web pages. You can store data in variables, define functions, and respond to user actions. console.log() prints debug output.',
    examples: [
      {
        title: 'Variables & log',
        code: 'const name = "Coder";\nconsole.log("Hello, " + name);',
      },
      {
        title: 'Function',
        code: 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 4));',
      },
    ],
    practiceQuestion: 'What is the difference between let and const?',
    codingTask: 'Write a function that returns the sum of two numbers and log the result.',
    instructions: [
      'Define a function in script.js.',
      'Call it with two numbers.',
      'Run Code and read the console output.',
    ],
    hints: [
      'Use return to send a value back.',
      'console.log() shows output in the console panel.',
    ],
    expectedOutput: '7',
    starterFiles: [
      {
        name: 'script.js',
        language: 'javascript',
        content: 'function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(3, 4));\n',
      },
    ],
  },
  {
    id: 'class-6-c-cpp-java',
    classNumber: 6,
    heading: 'Compiled Languages — C, C++, Java Intro',
    language: 'c',
    objectives: [
      'Recognize structure of C/C++/Java programs',
      'Write a basic Hello World in each language',
      'Understand compile-run workflow',
    ],
    theory:
      'C, C++, and Java are compiled languages — code is translated to machine instructions before running. Each has a main entry point and strict syntax rules.',
    examples: [
      {
        title: 'C Hello World',
        language: 'c',
        code: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
      },
      {
        title: 'Java Hello World',
        language: 'java',
        code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
      },
    ],
    practiceQuestion: 'What function is the entry point in a C program?',
    codingTask: 'Complete the C program to print "Hello, Alokbartika!"',
    instructions: [
      'Edit main.c with your message inside printf.',
      'Run Code to simulate compilation and execution.',
      'Try switching file tabs for C++, Java samples.',
    ],
    hints: [
      'C uses printf() with \\n for a new line.',
      'Every statement in C ends with a semicolon.',
    ],
    expectedOutput: 'Hello, Alokbartika!',
    starterFiles: [
      {
        name: 'main.c',
        language: 'c',
        content:
          '#include <stdio.h>\n\nint main() {\n    printf("Hello, Alokbartika!\\n");\n    return 0;\n}\n',
      },
      {
        name: 'main.cpp',
        language: 'cpp',
        content:
          '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n',
      },
      {
        name: 'Main.java',
        language: 'java',
        content:
          'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n',
      },
    ],
  },
]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
}

export const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  html: 'html',
  css: 'css',
  javascript: 'javascript',
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
}
