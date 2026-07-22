import type { ComponentType } from "react";

interface LessonProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

const lessonRegistry: Record<string, ComponentType<LessonProps>> = {};

function registerLesson(
  chapterId: string,
  subchapterId: string,
  component: ComponentType<LessonProps>
) {
  lessonRegistry[`${chapterId}:${subchapterId}`] = component;
}

export function getLessonComponent(
  chapterId: string,
  subchapterId: string
): ComponentType<LessonProps> | null {
  return lessonRegistry[`${chapterId}:${subchapterId}`] ?? null;
}

export type { LessonProps };

// ── Chapter 1: Hello World ──
import { Ch1Basic } from "./chapter-1/basic";
registerLesson("chapter-1", "ch1-basic", Ch1Basic);

import { Ch1SettingUp } from "./chapter-1/setting-up";
registerLesson("chapter-1", "ch1-setting-up", Ch1SettingUp);

import { Ch1Pattern } from "./chapter-1/pattern";
registerLesson("chapter-1", "ch1-pattern", Ch1Pattern);

import { Ch1Initials } from "./chapter-1/initials";
registerLesson("chapter-1", "ch1-initials", Ch1Initials);

import { Ch1SnailMail } from "./chapter-1/snail-mail";
registerLesson("chapter-1", "ch1-snail-mail", Ch1SnailMail);

// ── Chapter 2: Variables ──
import { Ch2Basic } from "./chapter-2/basic";
registerLesson("chapter-2", "ch2-basic", Ch2Basic);

import { Ch2DataTypes } from "./chapter-2/data-types";
registerLesson("chapter-2", "ch2-data-types", Ch2DataTypes);

import { Ch2Temperature } from "./chapter-2/temperature";
registerLesson("chapter-2", "ch2-temperature", Ch2Temperature);

import { Ch2Pythagorean } from "./chapter-2/pythagorean";
registerLesson("chapter-2", "ch2-pythagorean", Ch2Pythagorean);

import { Ch2Currency } from "./chapter-2/currency";
registerLesson("chapter-2", "ch2-currency", Ch2Currency);

// ── Chapter 3: Errors & Debugging ──
import { Ch3Basic } from "./chapter-3/basic";
registerLesson("chapter-3", "ch3-basic", Ch3Basic);

import { Ch3SyntaxError } from "./chapter-3/syntax-error";
registerLesson("chapter-3", "ch3-syntax-error", Ch3SyntaxError);

import { Ch3NameError } from "./chapter-3/name-error";
registerLesson("chapter-3", "ch3-name-error", Ch3NameError);

import { Ch3TypeError } from "./chapter-3/type-error";
registerLesson("chapter-3", "ch3-type-error", Ch3TypeError);

// ── Chapter 4: Loops ──
import { Ch4Basic } from "./chapter-4/basic";
registerLesson("chapter-4", "ch4-basic", Ch4Basic);

import { Ch4EnterPin } from "./chapter-4/enter-pin";
registerLesson("chapter-4", "ch4-enter-pin", Ch4EnterPin);

import { Ch4GuessNumber } from "./chapter-4/guess-number";
registerLesson("chapter-4", "ch4-guess-number", Ch4GuessNumber);

import { Ch4_99Bottles } from "./chapter-4/99-bottles";
registerLesson("chapter-4", "ch4-99-bottles", Ch4_99Bottles);

// ── Chapter 5: Lists ──
import { Ch5Basic } from "./chapter-5/basic";
registerLesson("chapter-5", "ch5-basic", Ch5Basic);

import { Ch5Grocery } from "./chapter-5/grocery";
registerLesson("chapter-5", "ch5-grocery", Ch5Grocery);

import { Ch5Todo } from "./chapter-5/todo";
registerLesson("chapter-5", "ch5-todo", Ch5Todo);

import { Ch5Inventory } from "./chapter-5/inventory";
registerLesson("chapter-5", "ch5-inventory", Ch5Inventory);

// ── Chapter 6: Functions ──
import { Ch6Basic } from "./chapter-6/basic";
registerLesson("chapter-6", "ch6-basic", Ch6Basic);

import { Ch6DryConcept } from "./chapter-6/dry-concept";
registerLesson("chapter-6", "ch6-dry", Ch6DryConcept);

import { Ch6MarsOrbiter } from "./chapter-6/mars-orbiter";
registerLesson("chapter-6", "ch6-mars-orbiter", Ch6MarsOrbiter);

import { Ch6Calculator } from "./chapter-6/calculator";
registerLesson("chapter-6", "ch6-calculator", Ch6Calculator);

// ── Chapter 7: Classes & Objects ──
import { Ch7Basic } from "./chapter-7/basic";
registerLesson("chapter-7", "ch7-basic", Ch7Basic);

import { Ch7Restaurants } from "./chapter-7/restaurants";
registerLesson("chapter-7", "ch7-restaurants", Ch7Restaurants);

import { Ch7FavoriteCities } from "./chapter-7/favorite-cities";
registerLesson("chapter-7", "ch7-favorite-cities", Ch7FavoriteCities);

import { Ch7BankAccounts } from "./chapter-7/bank-accounts";
registerLesson("chapter-7", "ch7-bank-accounts", Ch7BankAccounts);

// ── Chapter 8: Modules ──
import { Ch8Basic } from "./chapter-8/basic";
registerLesson("chapter-8", "ch8-basic", Ch8Basic);

import { Ch8SlotMachine } from "./chapter-8/slot-machine";
registerLesson("chapter-8", "ch8-slot-machine", Ch8SlotMachine);

import { Ch8Countdown } from "./chapter-8/countdown";
registerLesson("chapter-8", "ch8-countdown", Ch8Countdown);

import { Ch8ZenOfPython } from "./chapter-8/zen-of-python";
registerLesson("chapter-8", "ch8-zen-of-python", Ch8ZenOfPython);
