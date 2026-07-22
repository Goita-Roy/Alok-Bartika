import type { Course } from "../types";

export const courseData: Course = {
  id: "python-101",
  title: "শুরুর জন্য Python",
  description:
    "Hello World থেকে Modules পর্যন্ত Python-এর মৌলিক বিষয়গুলো নিয়ে একটি পূর্ণাঙ্গ কোর্স।",
  chapters: [
    {
      id: "chapter-1",
      slug: "chapter-1",
      title: "হ্যালো ওয়ার্ল্ড",
      subchapters: [
        {
          id: "ch1-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Learn how to write your first Python program. The print() function displays output to the console.",
        },
        {
          id: "ch1-setting-up",
          slug: "setting-up",
          title: "সেটআপ করা",
          content:
            "Install Python and configure your development environment. We recommend using VS Code with the Python extension.",
        },
        {
          id: "ch1-pattern",
          slug: "pattern",
          title: "প্যাটার্ন",
          content:
            "Create visual patterns using nested print statements. Practice string repetition and formatting.",
        },
        {
          id: "ch1-initials",
          slug: "initials",
          title: "নামের আদ্যক্ষর",
          content:
            "Print your initials using ASCII art. Combine multiple print statements creatively.",
        },
        {
          id: "ch1-snail-mail",
          slug: "snail-mail",
          title: "স্নেইল মেইল",
          content:
            "Build a text-based snail mail simulator using formatted strings and escape characters.",
        },
      ],
    },
    {
      id: "chapter-2",
      slug: "chapter-2",
      title: "ভেরিয়েবল",
      subchapters: [
        {
          id: "ch2-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Understand variables as named containers for storing data. Learn about assignment and naming conventions.",
        },
        {
          id: "ch2-data-types",
          slug: "data-types",
          title: "ডেটা টাইপ",
          content:
            "Explore Python's core data types: integers, floats, strings, and booleans. Learn type checking with type().",
        },
        {
          id: "ch2-temperature",
          slug: "temperature",
          title: "তাপমাত্রা",
          content:
            "Build a temperature converter between Celsius and Fahrenheit. Practice arithmetic with variables.",
        },
        {
          id: "ch2-bmi",
          slug: "bmi",
          title: "BMI",
          content:
            "Calculate Body Mass Index using user input. Combine variables, arithmetic, and type conversion.",
        },
        {
          id: "ch2-pythagorean",
          slug: "pythagorean",
          title: "পিথাগোরিয়ান",
          content:
            "Implement the Pythagorean theorem to calculate the hypotenuse. Use the math module for square roots.",
        },
        {
          id: "ch2-currency",
          slug: "currency",
          title: "মুদ্রা",
          content:
            "Create a currency converter with exchange rates. Practice multiplying variables and formatting output.",
        },
      ],
    },
    {
      id: "chapter-3",
      slug: "chapter-3",
      title: "এরর ও ডিবাগিং",
      subchapters: [
        {
          id: "ch3-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Understand why errors occur in programming. Learn to read and interpret Python error messages.",
        },
        {
          id: "ch3-syntax-error",
          slug: "syntax-error",
          title: "সিনট্যাক্স এরর",
          content:
            "Identify and fix syntax errors like missing colons, unmatched parentheses, and indentation issues.",
        },
        {
          id: "ch3-name-error",
          slug: "name-error",
          title: "নেম এরর",
          content:
            "Debug NameError exceptions caused by using undefined variables or misspelled function names.",
        },
        {
          id: "ch3-type-error",
          slug: "type-error",
          title: "টাইপ এরর",
          content:
            "Resolve TypeError exceptions from incompatible operations, such as adding strings and integers.",
        },
      ],
    },
    {
      id: "chapter-4",
      slug: "chapter-4",
      title: "লুপ",
      subchapters: [
        {
          id: "ch4-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Master for loops and while loops. Understand iteration, range(), and loop control statements.",
        },
        {
          id: "ch4-enter-pin",
          slug: "enter-pin",
          title: "PIN দিন",
          content:
            "Build a PIN validation system using while loops. Implement retry logic and attempt limits.",
        },
        {
          id: "ch4-guess-number",
          slug: "guess-number",
          title: "সংখ্যা অনুমান",
          content:
            "Create a number guessing game. Combine loops, conditionals, and random number generation.",
        },
        {
          id: "ch4-99-bottles",
          slug: "99-bottles",
          title: "৯৯ বোতল",
          content:
            "Generate the '99 Bottles of Beer' song using string formatting and loop iteration.",
        },
      ],
    },
    {
      id: "chapter-5",
      slug: "chapter-5",
      title: "লিস্ট",
      subchapters: [
        {
          id: "ch5-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Learn about Python lists: creating, indexing, slicing, and modifying. Understand mutability.",
        },
        {
          id: "ch5-grocery",
          slug: "grocery",
          title: "মুদিখানা",
          content:
            "Build a grocery list manager. Practice append, remove, sort, and list comprehensions.",
        },
        {
          id: "ch5-todo",
          slug: "to-do",
          title: "করণীয় তালিকা",
          content:
            "Create a to-do list application with add, complete, and delete functionality using lists.",
        },
        {
          id: "ch5-inventory",
          slug: "inventory",
          title: "ইনভেন্টরি",
          content:
            "Manage a game inventory system. Work with nested lists, dictionaries, and list methods.",
        },
      ],
    },
    {
      id: "chapter-6",
      slug: "chapter-6",
      title: "ফাংশন",
      subchapters: [
        {
          id: "ch6-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Define and call functions. Understand parameters, return values, and the def keyword.",
        },
        {
          id: "ch6-dry",
          slug: "dry-concept",
          title: "D.R.Y. ধারণা",
          content:
            "Apply the Don't Repeat Yourself principle. Refactor repetitive code into reusable functions.",
        },
        {
          id: "ch6-mars-orbiter",
          slug: "mars-orbiter",
          title: "মার্স অরবিটার",
          content:
            "Solve the Mars Orbiter unit conversion bug. Use functions to handle metric-imperial conversions.",
        },
        {
          id: "ch6-calculator",
          slug: "calculator",
          title: "ক্যালকুলেটর",
          content:
            "Build a calculator with functions for each operation. Practice function composition and modularity.",
        },
      ],
    },
    {
      id: "chapter-7",
      slug: "chapter-7",
      title: "ক্লাস ও অবজেক্ট",
      subchapters: [
        {
          id: "ch7-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Understand object-oriented programming fundamentals. Learn about classes, objects, methods, and attributes.",
        },
        {
          id: "ch7-restaurants",
          slug: "restaurants",
          title: "রেস্টুরেন্ট",
          content:
            "Model a restaurant with classes. Implement methods for ordering, menus, and bill calculation.",
        },
        {
          id: "ch7-favorite-cities",
          slug: "favorite-cities",
          title: "প্রিয় শহর",
          content:
            "Create a City class with attributes and methods. Practice encapsulation and string representation.",
        },
        {
          id: "ch7-bank-accounts",
          slug: "bank-accounts",
          title: "ব্যাংক অ্যাকাউন্ট",
          content:
            "Build a banking system with deposit, withdrawal, and transfer. Understand class relationships.",
        },
      ],
    },
    {
      id: "chapter-8",
      slug: "chapter-8",
      title: "মডিউল",
      subchapters: [
        {
          id: "ch8-basic",
          slug: "basic",
          title: "মৌলিক",
          content:
            "Learn to import and use Python modules. Understand the difference between modules and packages.",
        },
        {
          id: "ch8-slot-machine",
          slug: "slot-machine",
          title: "স্লট মেশিন",
          content:
            "Build a slot machine game using the random module. Practice module imports and randomization.",
        },
        {
          id: "ch8-countdown",
          slug: "countdown",
          title: "কাউন্টডাউন",
          content:
            "Create a countdown timer using the time module. Practice while loops with time.sleep().",
        },
        {
          id: "ch8-zen-of-python",
          slug: "zen-of-python",
          title: "Zen of Python",
          content:
            "Discover the Zen of Python with 'import this'. Explore Python's design philosophy and core principles.",
        },
      ],
    },
  ],
};
