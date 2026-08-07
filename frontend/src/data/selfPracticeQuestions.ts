export type SelfPracticeQuestion = {
  id: string
  practiceNumber: number
  title: string
  statement: string
}

export const selfPracticeQuestions: SelfPracticeQuestion[] = [
  {
    id: 'self-practice-1',
    practiceNumber: 1,
    title: 'Hello, Alokbartika!',
    statement:
      'Write a Python program that prints the message "Hello, Alokbartika!" on the screen.',
  },
  {
    id: 'self-practice-2',
    practiceNumber: 2,
    title: 'Formatted Output',
    statement:
      'Write a Python program that prints your name, class and favourite subject using formatted output.',
  },
  {
    id: 'self-practice-3',
    practiceNumber: 3,
    title: 'Welcome Banner',
    statement:
      'Write a Python program that prints a welcome banner using multiple lines of text.',
  },
  {
    id: 'self-practice-4',
    practiceNumber: 4,
    title: 'Print Your Name',
    statement:
      'Write a Python program that stores your name in a variable and then prints it.',
  },
  {
    id: 'self-practice-5',
    practiceNumber: 5,
    title: 'Student Introduction',
    statement:
      'Write a Python program that prints your name, class and favourite subject on separate lines.',
  },
]