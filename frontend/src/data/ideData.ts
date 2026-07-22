export interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  initialCode: string;
  language: string;
  category: string;
  solution?: string;
  expectedOutput?: string;
}

export interface IDEClass {
  id: string;
  title: string;
  icon: string;
  problems: Problem[];
}

export const ideClasses: IDEClass[] = [
  {
    id: 'python-basics',
    title: 'Python Basics',
    icon: '🐍',
    problems: [
      {
        id: 'pb1',
        title: 'Question 1 — Print Your Name',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Print your name using Python.',
        solution: 'print("Rahul")',
        initialCode: 'print("Rahul")',
        language: 'python'
      },
      {
        id: 'pb2',
        title: 'Question 2 — Add Two Numbers',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Add two numbers and print the result.',
        solution: 'a = 5\nb = 3\nprint(a + b)',
        initialCode: 'a = 5\nb = 3\nprint(a + b)',
        language: 'python'
      },
      {
        id: 'pb3',
        title: 'Question 3 — Even or Odd',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Check whether a number is even or odd.',
        solution: 'num = 8\n\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
        initialCode: 'num = 8\n\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
        language: 'python'
      },
      {
        id: 'pb4',
        title: 'Question 4 — Multiplication Table',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Print the multiplication table of 2.',
        solution: 'for i in range(1, 11):\n    print(2 * i)',
        initialCode: 'for i in range(1, 11):\n    print(2 * i)',
        language: 'python'
      },
      {
        id: 'pb5',
        title: 'Question 5',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Print numbers from 1 to 20.',
        initialCode: '# Write your code here',
        expectedOutput: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20",
        language: 'python'
      },
      {
        id: 'pb6',
        title: 'Question 6',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Find the biggest number among 3 numbers.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'pb7',
        title: 'Question 7',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Calculate the sum of first 10 natural numbers.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'pb8',
        title: 'Question 8',
        difficulty: 'Easy',
        category: 'Basics',
        description: 'Print all even numbers between 1 and 50.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    icon: '📊',
    problems: [
      {
        id: 'ds1',
        title: 'Question 1 — Create a List',
        difficulty: 'Medium',
        category: 'Lists',
        description: 'Create a list of 5 fruits and print it.',
        solution: 'fruits = ["Apple", "Banana", "Mango", "Orange", "Grapes"]\nprint(fruits)',
        initialCode: 'fruits = ["Apple", "Banana", "Mango", "Orange", "Grapes"]\nprint(fruits)',
        language: 'python'
      },
      {
        id: 'ds2',
        title: 'Question 2 — Access List Item',
        difficulty: 'Medium',
        category: 'Lists',
        description: 'Print the first item in a list.',
        solution: 'numbers = [10, 20, 30]\nprint(numbers[0])',
        initialCode: 'numbers = [10, 20, 30]\nprint(numbers[0])',
        language: 'python'
      },
      {
        id: 'ds3',
        title: 'Question 3 — Add Item to List',
        difficulty: 'Medium',
        category: 'Lists',
        description: 'Add a new color to a list.',
        solution: 'colors = ["Red", "Blue"]\ncolors.append("Green")\nprint(colors)',
        initialCode: 'colors = ["Red", "Blue"]\ncolors.append("Green")\nprint(colors)',
        language: 'python'
      },
      {
        id: 'ds4',
        title: 'Question 4 — Dictionary Example',
        difficulty: 'Medium',
        category: 'Dictionaries',
        description: 'Print the age from a dictionary.',
        solution: 'student = {\n    "name": "Aman",\n    "age": 12\n}\n\nprint(student["age"])',
        initialCode: 'student = {\n    "name": "Aman",\n    "age": 12\n}\n\nprint(student["age"])',
        language: 'python'
      },
      {
        id: 'ds5',
        title: 'Question 5',
        difficulty: 'Medium',
        category: 'Lists',
        description: 'Count how many items are in a list [10, 20, 30, 40].',
        initialCode: 'nums = [10, 20, 30, 40]\n# print length here',
        expectedOutput: "4",
        language: 'python'
      },
      {
        id: 'ds6',
        title: 'Question 6',
        difficulty: 'Medium',
        category: 'Lists',
        description: 'Remove an item from a list.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'ds7',
        title: 'Question 7',
        difficulty: 'Medium',
        category: 'Tuples',
        description: 'Store 5 student names in a tuple.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'ds8',
        title: 'Question 8',
        difficulty: 'Medium',
        category: 'Dictionaries',
        description: 'Create a dictionary with country and capital names.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    icon: '⚙️',
    problems: [
      {
        id: 'alg1',
        title: 'Question 1 — Find Largest Number',
        difficulty: 'Hard',
        category: 'Search',
        description: 'Find the largest number in a list.',
        solution: 'numbers = [2, 8, 5, 1]\nprint(max(numbers))',
        initialCode: 'numbers = [2, 8, 5, 1]\nprint(max(numbers))',
        language: 'python'
      },
      {
        id: 'alg2',
        title: 'Question 2 — Reverse a Word',
        difficulty: 'Hard',
        category: 'Strings',
        description: 'Reverse a word.',
        solution: 'word = "Python"\nprint(word[::-1])',
        initialCode: 'word = "Python"\nprint(word[::-1])',
        language: 'python'
      },
      {
        id: 'alg3',
        title: 'Question 3 — Count Vowels',
        difficulty: 'Hard',
        category: 'Strings',
        description: 'Count vowels in a word.',
        solution: 'word = "apple"\ncount = 0\n\nfor ch in word:\n    if ch in "aeiou":\n        count += 1\n\nprint(count)',
        initialCode: 'word = "apple"\ncount = 0\n\nfor ch in word:\n    if ch in "aeiou":\n        count += 1\n\nprint(count)',
        language: 'python'
      },
      {
        id: 'alg4',
        title: 'Question 4 — Search a Number',
        difficulty: 'Hard',
        category: 'Search',
        description: 'Check whether a number exists in a list.',
        solution: 'numbers = [1, 2, 3, 4]\n\nif 3 in numbers:\n    print("Found")',
        initialCode: 'numbers = [1, 2, 3, 4]\n\nif 3 in numbers:\n    print("Found")',
        language: 'python'
      },
      {
        id: 'alg5',
        title: 'Question 5',
        difficulty: 'Hard',
        category: 'Sorting',
        description: 'Arrange numbers in ascending order.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'alg6',
        title: 'Question 6',
        difficulty: 'Hard',
        category: 'Search',
        description: 'Find the smallest number in a list.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'alg7',
        title: 'Question 7',
        difficulty: 'Hard',
        category: 'Strings',
        description: 'Check whether a word is a palindrome.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'alg8',
        title: 'Question 8',
        difficulty: 'Hard',
        category: 'Math',
        description: 'Find the sum of all numbers in a list.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  },
  {
    id: 'oop-python',
    title: 'Object-Oriented Python',
    icon: '🏛️',
    problems: [
      {
        id: 'oop1',
        title: 'Question 1 — Create a Class',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create a class named Dog.',
        solution: 'class Dog:\n    pass',
        initialCode: 'class Dog:\n    pass',
        language: 'python'
      },
      {
        id: 'oop2',
        title: 'Question 2 — Create an Object',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create an object of a class.',
        solution: 'class Car:\n    pass\n\nobj = Car()\nprint(obj)',
        initialCode: 'class Car:\n    pass\n\nobj = Car()\nprint(obj)',
        language: 'python'
      },
      {
        id: 'oop3',
        title: 'Question 3 — Use a Constructor',
        difficulty: 'Medium',
        category: 'OOP',
        description: "Store a student's name using constructor.",
        solution: 'class Student:\n    def __init__(self, name):\n        self.name = name\n\ns1 = Student("Riya")\nprint(s1.name)',
        initialCode: 'class Student:\n    def __init__(self, name):\n        self.name = name\n\ns1 = Student("Riya")\nprint(s1.name)',
        language: 'python'
      },
      {
        id: 'oop4',
        title: 'Question 4 — Class Method',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create a method that prints Hello.',
        solution: 'class Hello:\n    def greet(self):\n        print("Hello")\n\nobj = Hello()\nobj.greet()',
        initialCode: 'class Hello:\n    def greet(self):\n        print("Hello")\n\nobj = Hello()\nobj.greet()',
        language: 'python'
      },
      {
        id: 'oop5',
        title: 'Question 5',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create a class for a mobile phone.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'oop6',
        title: 'Question 6',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create a class with name and age.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'oop7',
        title: 'Question 7',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create a class for rectangle and find area.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'oop8',
        title: 'Question 8',
        difficulty: 'Medium',
        category: 'OOP',
        description: 'Create a class for a bank account.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  },
  {
    id: 'functional-prog',
    title: 'Functional Programming',
    icon: 'λ',
    problems: [
      {
        id: 'fp1',
        title: 'Question 1 — Lambda Function',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Create a lambda function to add two numbers.',
        solution: 'add = lambda a, b: a + b\nprint(add(2, 3))',
        initialCode: 'add = lambda a, b: a + b\nprint(add(2, 3))',
        language: 'python'
      },
      {
        id: 'fp2',
        title: 'Question 2 — map()',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Double all numbers in a list.',
        solution: 'numbers = [1, 2, 3]\n\nresult = list(map(lambda x: x * 2, numbers))\nprint(result)',
        initialCode: 'numbers = [1, 2, 3]\n\nresult = list(map(lambda x: x * 2, numbers))\nprint(result)',
        language: 'python'
      },
      {
        id: 'fp3',
        title: 'Question 3 — filter()',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Get even numbers from a list.',
        solution: 'numbers = [1, 2, 3, 4]\n\nresult = list(filter(lambda x: x % 2 == 0, numbers))\nprint(result)',
        initialCode: 'numbers = [1, 2, 3, 4]\n\nresult = list(filter(lambda x: x % 2 == 0, numbers))\nprint(result)',
        language: 'python'
      },
      {
        id: 'fp4',
        title: 'Question 4 — List Comprehension',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Create squares of numbers from 1 to 5.',
        solution: 'squares = [x * x for x in range(1, 6)]\nprint(squares)',
        initialCode: 'squares = [x * x for x in range(1, 6)]\nprint(squares)',
        language: 'python'
      },
      {
        id: 'fp5',
        title: 'Question 5',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Create squares of numbers using list comprehension.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'fp6',
        title: 'Question 6',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Use zip() to join two lists.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'fp7',
        title: 'Question 7',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Create a simple recursive function.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'fp8',
        title: 'Question 8',
        difficulty: 'Medium',
        category: 'Functional',
        description: 'Create a generator for numbers from 1 to 5.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  },
  {
    id: 'advanced-modules',
    title: 'Modules & Libraries',
    icon: '📦',
    problems: [
      {
        id: 'ml1',
        title: 'Question 1 — Use math Module',
        difficulty: 'Easy',
        category: 'Modules',
        description: 'Find square root using the math module.',
        solution: 'import math\nprint(math.sqrt(16))',
        initialCode: 'import math\nprint(math.sqrt(16))',
        language: 'python'
      },
      {
        id: 'ml2',
        title: 'Question 2 — Random Number',
        difficulty: 'Easy',
        category: 'Modules',
        description: 'Generate a random number between 1 and 10.',
        solution: 'import random\nprint(random.randint(1, 10))',
        initialCode: 'import random\nprint(random.randint(1, 10))',
        language: 'python'
      },
      {
        id: 'ml3',
        title: 'Question 3 — Current Date',
        difficulty: 'Easy',
        category: 'Modules',
        description: 'Print current date.',
        solution: 'from datetime import date\nprint(date.today())',
        initialCode: 'from datetime import date\nprint(date.today())',
        language: 'python'
      },
      {
        id: 'ml4',
        title: 'Question 4 — Import a Module',
        difficulty: 'Easy',
        category: 'Modules',
        description: 'Import a custom module.',
        solution: '# mymodule.py\ndef hello():\n    print("Hello")\n\n# main.py\nimport mymodule\n\nmymodule.hello()',
        initialCode: '# mymodule.py\ndef hello():\n    print("Hello")\n\n# main.py\nimport mymodule\n\nmymodule.hello()',
        language: 'python'
      },
      {
        id: 'ml5',
        title: 'Question 5',
        difficulty: 'Easy',
        category: 'File IO',
        description: 'Read a text file.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'ml6',
        title: 'Question 6',
        difficulty: 'Easy',
        category: 'File IO',
        description: 'Write text into a file.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'ml7',
        title: 'Question 7',
        difficulty: 'Easy',
        category: 'Modules',
        description: 'Use the calendar module to print a month.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'ml8',
        title: 'Question 8',
        difficulty: 'Easy',
        category: 'Modules',
        description: 'Use the random module to create a dice game.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  },
  {
    id: 'gui-graphics',
    title: 'GUI & Graphics',
    icon: '🎨',
    problems: [
      {
        id: 'gg1',
        title: 'Question 1 — Create a Window',
        difficulty: 'Medium',
        category: 'GUI',
        description: 'Create a simple GUI window using Tkinter.',
        solution: 'from tkinter import *\n\nwindow = Tk()\nwindow.title("My Window")\nwindow.geometry("300x200")\n\nwindow.mainloop()',
        initialCode: 'from tkinter import *\n\nwindow = Tk()\nwindow.title("My Window")\nwindow.geometry("300x200")\n\nwindow.mainloop()',
        language: 'python'
      },
      {
        id: 'gg2',
        title: 'Question 2 — Add a Label',
        difficulty: 'Medium',
        category: 'GUI',
        description: 'Display a text label in a window.',
        solution: 'from tkinter import *\n\nwindow = Tk()\n\nlabel = Label(window, text="Hello Students")\nlabel.pack()\n\nwindow.mainloop()',
        initialCode: 'from tkinter import *\n\nwindow = Tk()\n\nlabel = Label(window, text="Hello Students")\nlabel.pack()\n\nwindow.mainloop()',
        language: 'python'
      },
      {
        id: 'gg3',
        title: 'Question 3 — Create a Button',
        difficulty: 'Medium',
        category: 'GUI',
        description: 'Create a button in Tkinter.',
        solution: 'from tkinter import *\n\nwindow = Tk()\n\nbutton = Button(window, text="Click Me")\nbutton.pack()\n\nwindow.mainloop()',
        initialCode: 'from tkinter import *\n\nwindow = Tk()\n\nbutton = Button(window, text="Click Me")\nbutton.pack()\n\nwindow.mainloop()',
        language: 'python'
      },
      {
        id: 'gg4',
        title: 'Question 4 — Draw a Line',
        difficulty: 'Medium',
        category: 'Graphics',
        description: 'Draw a line using Turtle graphics.',
        solution: 'import turtle\n\npen = turtle.Turtle()\npen.forward(100)\n\nturtle.done()',
        initialCode: 'import turtle\n\npen = turtle.Turtle()\npen.forward(100)\n\nturtle.done()',
        language: 'python'
      },
      {
        id: 'gg5',
        title: 'Question 5 (Home Task)',
        difficulty: 'Medium',
        category: 'Graphics',
        description: 'Draw a square using Turtle graphics.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'gg6',
        title: 'Question 6 (Home Task)',
        difficulty: 'Medium',
        category: 'GUI',
        description: 'Create a GUI window with two buttons.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'gg7',
        title: 'Question 7 (Home Task)',
        difficulty: 'Medium',
        category: 'Graphics',
        description: 'Draw a circle using Turtle graphics.',
        initialCode: '# Write your code here',
        language: 'python'
      },
      {
        id: 'gg8',
        title: 'Question 8 (Home Task)',
        difficulty: 'Medium',
        category: 'GUI',
        description: 'Create a simple calculator GUI using Tkinter.',
        initialCode: '# Write your code here',
        language: 'python'
      }
    ]
  }
];
