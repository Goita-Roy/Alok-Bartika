import type { Course } from "../types";

export const courseData: Course = {
  id: "python-101",
  title: "Python for Beginners",
  description:
    "A comprehensive course covering Python fundamentals from Hello World to Modules.",
  chapters: [
    {
      id: "chapter-1",
      slug: "chapter-1",
      title: "Hello World",
      subchapters: [
        {
          id: "ch1-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Learn how to write your first Python program. The print() function displays output to the console.",
        },
        {
          id: "ch1-setting-up",
          slug: "setting-up",
          title: "Setting Up",
          content:
            "Install Python and configure your development environment. We recommend using VS Code with the Python extension.",
        },
        {
          id: "ch1-pattern",
          slug: "pattern",
          title: "Pattern",
          content:
            "Create visual patterns using nested print statements. Practice string repetition and formatting.",
        },
        {
          id: "ch1-initials",
          slug: "initials",
          title: "Initials",
          content:
            "Print your initials using ASCII art. Combine multiple print statements creatively.",
        },
        {
          id: "ch1-snail-mail",
          slug: "snail-mail",
          title: "Snail Mail",
          content:
            "Build a text-based snail mail simulator using formatted strings and escape characters.",
        },
      ],
    },
    {
      id: "chapter-2",
      slug: "chapter-2",
      title: "Variables",
      subchapters: [
        {
          id: "ch2-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Understand variables as named containers for storing data. Learn about assignment and naming conventions.",
        },
        {
          id: "ch2-data-types",
          slug: "data-types",
          title: "Data Types",
          content:
            "Explore Python's core data types: integers, floats, strings, and booleans. Learn type checking with type().",
        },
        {
          id: "ch2-temperature",
          slug: "temperature",
          title: "Temperature",
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
          title: "Pythagorean",
          content:
            "Implement the Pythagorean theorem to calculate the hypotenuse. Use the math module for square roots.",
        },
        {
          id: "ch2-currency",
          slug: "currency",
          title: "Currency",
          content:
            "Create a currency converter with exchange rates. Practice multiplying variables and formatting output.",
        },
      ],
    },
    {
      id: "chapter-3",
      slug: "chapter-3",
      title: "Errors & Debugging",
      subchapters: [
        {
          id: "ch3-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Understand why errors occur in programming. Learn to read and interpret Python error messages.",
        },
        {
          id: "ch3-syntax-error",
          slug: "syntax-error",
          title: "Syntax Error",
          content:
            "Identify and fix syntax errors like missing colons, unmatched parentheses, and indentation issues.",
        },
        {
          id: "ch3-name-error",
          slug: "name-error",
          title: "Name Error",
          content:
            "Debug NameError exceptions caused by using undefined variables or misspelled function names.",
        },
        {
          id: "ch3-type-error",
          slug: "type-error",
          title: "Type Error",
          content:
            "Resolve TypeError exceptions from incompatible operations, such as adding strings and integers.",
        },
      ],
    },
    {
      id: "chapter-4",
      slug: "chapter-4",
      title: "Loops",
      subchapters: [
        {
          id: "ch4-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Master for loops and while loops. Understand iteration, range(), and loop control statements.",
        },
        {
          id: "ch4-enter-pin",
          slug: "enter-pin",
          title: "Enter PIN",
          content:
            "Build a PIN validation system using while loops. Implement retry logic and attempt limits.",
        },
        {
          id: "ch4-guess-number",
          slug: "guess-number",
          title: "Guess Number",
          content:
            "Create a number guessing game. Combine loops, conditionals, and random number generation.",
        },
        {
          id: "ch4-99-bottles",
          slug: "99-bottles",
          title: "99 Bottles",
          content:
            "Generate the '99 Bottles of Beer' song using string formatting and loop iteration.",
        },
      ],
    },
    {
      id: "chapter-5",
      slug: "chapter-5",
      title: "Lists",
      subchapters: [
        {
          id: "ch5-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Learn about Python lists: creating, indexing, slicing, and modifying. Understand mutability.",
        },
        {
          id: "ch5-grocery",
          slug: "grocery",
          title: "Grocery",
          content:
            "Build a grocery list manager. Practice append, remove, sort, and list comprehensions.",
        },
        {
          id: "ch5-todo",
          slug: "to-do",
          title: "To-Do",
          content:
            "Create a to-do list application with add, complete, and delete functionality using lists.",
        },
        {
          id: "ch5-inventory",
          slug: "inventory",
          title: "Inventory",
          content:
            "Manage a game inventory system. Work with nested lists, dictionaries, and list methods.",
        },
      ],
    },
    {
      id: "chapter-6",
      slug: "chapter-6",
      title: "Functions",
      subchapters: [
        {
          id: "ch6-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Define and call functions. Understand parameters, return values, and the def keyword.",
        },
        {
          id: "ch6-dry",
          slug: "dry-concept",
          title: "D.R.Y. Concept",
          content:
            "Apply the Don't Repeat Yourself principle. Refactor repetitive code into reusable functions.",
        },
        {
          id: "ch6-mars-orbiter",
          slug: "mars-orbiter",
          title: "Mars Orbiter",
          content:
            "Solve the Mars Orbiter unit conversion bug. Use functions to handle metric-imperial conversions.",
        },
        {
          id: "ch6-calculator",
          slug: "calculator",
          title: "Calculator",
          content:
            "Build a calculator with functions for each operation. Practice function composition and modularity.",
        },
      ],
    },
    {
      id: "chapter-7",
      slug: "chapter-7",
      title: "Classes & Objects",
      subchapters: [
        {
          id: "ch7-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Understand object-oriented programming fundamentals. Learn about classes, objects, methods, and attributes.",
        },
        {
          id: "ch7-restaurants",
          slug: "restaurants",
          title: "Restaurants",
          content:
            "Model a restaurant with classes. Implement methods for ordering, menus, and bill calculation.",
        },
        {
          id: "ch7-favorite-cities",
          slug: "favorite-cities",
          title: "Favorite Cities",
          content:
            "Create a City class with attributes and methods. Practice encapsulation and string representation.",
        },
        {
          id: "ch7-bank-accounts",
          slug: "bank-accounts",
          title: "Bank Accounts",
          content:
            "Build a banking system with deposit, withdrawal, and transfer. Understand class relationships.",
        },
      ],
    },
    {
      id: "chapter-8",
      slug: "chapter-8",
      title: "Modules",
      subchapters: [
        {
          id: "ch8-basic",
          slug: "basic",
          title: "Basic",
          content:
            "Learn to import and use Python modules. Understand the difference between modules and packages.",
        },
        {
          id: "ch8-slot-machine",
          slug: "slot-machine",
          title: "Slot Machine",
          content:
            "Build a slot machine game using the random module. Practice module imports and randomization.",
        },
        {
          id: "ch8-countdown",
          slug: "countdown",
          title: "Countdown",
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
