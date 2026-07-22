import type { ClassItem } from "./LessonNavigation";

export const lessonClasses: ClassItem[] = [
  { id: "class-01", label: "ক্লাস ০১", title: "কম্পিউটার পরিচিতি", anchorId: "definition" },
  { id: "class-02", label: "ক্লাস ০২", title: "সিপিইউ (CPU)", anchorId: "cpu-definition" },
  { id: "class-03", label: "ক্লাস ০৩", title: "র‍্যাম (RAM)", anchorId: "ram-definition" },
  { id: "class-04", label: "ক্লাস ০৪", title: "স্টোরেজ (Storage)", anchorId: "storage-definition" },
  { id: "class-05", label: "ক্লাস ০৫", title: "ইনপুট ডিভাইস", anchorId: "input-definition" },
  { id: "class-06", label: "ক্লাস ০৬", title: "আউটপুট ডিভাইস", anchorId: "output-definition" },
  { id: "class-07", label: "ক্লাস ০৭", title: "সফটওয়্যার", anchorId: "software-definition" },
  { id: "class-08", label: "ক্লাস ০৮", title: "অপারেটিং সিস্টেম", anchorId: "os-definition" },
  { id: "class-09", label: "ক্লাস ০৯", title: "ইন্টারনেটের দুনিয়া", anchorId: "internet-definition" },
  { id: "class-10", label: "ক্লাস ১০", title: "সাইবার নিরাপত্তা", anchorId: "security-definition" },
];

export function classIdToPath(classId: string): string {
  return `/courses/beginner/${classId}`;
}

export interface SectionAnchor {
  id: string;
  label: string;
}

const classSectionIds: Record<string, string[]> = {
  "class-01": ["definition", "brain-teaser", "real-life", "how-it-works", "timeline", "game"],
  "class-02": ["cpu-definition", "cpu-brain-teaser", "cpu-real-life", "cpu-how-it-works", "cpu-animation", "cpu-game"],
  "class-03": ["ram-definition", "ram-brain-teaser", "ram-real-life", "ram-how-it-works", "ram-animation", "ram-game"],
  "class-04": ["storage-definition", "storage-brain-teaser", "storage-real-life", "storage-how-it-works", "storage-animation", "storage-game"],
  "class-05": ["input-definition", "input-brain-teaser", "input-real-life", "input-how-it-works", "input-animation", "input-game"],
  "class-06": ["output-definition", "output-brain-teaser", "output-real-life", "output-how-it-works", "output-animation", "output-game"],
  "class-07": ["software-definition", "software-brain-teaser", "software-real-life", "software-how-it-works", "software-animation", "software-game"],
  "class-08": ["os-definition", "os-brain-teaser", "os-real-life", "os-how-it-works", "os-animation", "os-game"],
  "class-09": ["internet-definition", "internet-brain-teaser", "internet-real-life", "internet-how-it-works", "internet-animation", "internet-game"],
  "class-10": ["security-definition", "security-brain-teaser", "security-real-life", "security-how-it-works", "security-animation", "security-game"],
};

const classSectionLabels: Record<string, string[]> = {
  "class-01": ["Definition", "Brain Teaser", "Real Life", "How It Works", "Timeline", "Game"],
  "class-02": ["CPU Def", "CPU Q", "CPU Real", "CPU How", "CPU Anim", "CPU Game"],
  "class-03": ["RAM Def", "RAM Q", "RAM Real", "RAM How", "RAM Anim", "RAM Game"],
  "class-04": ["Storage Def", "Storage Q", "Storage Real", "Storage How", "Storage Anim", "Storage Game"],
  "class-05": ["Input Def", "Input Q", "Input Real", "Input How", "Input Anim", "Input Game"],
  "class-06": ["Output Def", "Output Q", "Output Real", "Output How", "Output Anim", "Output Game"],
  "class-07": ["SW Def", "SW Q", "SW Real", "SW How", "SW Anim", "SW Game"],
  "class-08": ["OS Def", "OS Q", "OS Real", "OS How", "OS Anim", "OS Game"],
  "class-09": ["Net Def", "Net Q", "Net Real", "Net How", "Net Anim", "Net Game"],
  "class-10": ["Sec Def", "Sec Q", "Sec Real", "Sec How", "Sec Anim", "Sec Game"],
};

export const classSectionAnchors: Record<string, SectionAnchor[]> = {};

for (const classId of Object.keys(classSectionIds)) {
  const ids = classSectionIds[classId];
  const labels = classSectionLabels[classId];
  classSectionAnchors[classId] = ids.map((id, i) => ({ id, label: labels[i] }));
}

export interface ClassHero {
  icon: string;
  title: string;
  subtitle: string;
}

export const classHeroes: Record<string, ClassHero> = {
  "class-01": { icon: "\u{1F4BB}", title: "Computer Introduction", subtitle: "An interactive learning experience" },
  "class-02": { icon: "\u{1F9E0}", title: "Central Processing Unit (CPU)", subtitle: "Brain of the computer" },
  "class-03": { icon: "\u{1F9E9}", title: "Memory (RAM - Volatile Memory)", subtitle: "Temporary memory" },
  "class-04": { icon: "\u{1F4BE}", title: "Storage (Non-Volatile Memory)", subtitle: "Permanent data storage" },
  "class-05": { icon: "\u{2328}\u{FE0F}", title: "Input Devices", subtitle: "Eyes and ears of the computer" },
  "class-06": { icon: "\u{1F5A5}\u{FE0F}", title: "Output Devices", subtitle: "Voice and language of the computer" },
  "class-07": { icon: "\u{1F4E6}", title: "Software", subtitle: "The brain and soul of the computer" },
  "class-08": { icon: "\u{1F5A5}\u{FE0F}", title: "Operating System (OS)", subtitle: "The manager of the computer" },
  "class-09": { icon: "\u{1F310}", title: "The Internet", subtitle: "The ocean of information" },
  "class-10": { icon: "\u{1F6E1}\u{FE0F}", title: "Cyber Security", subtitle: "Digital fortress guard" },
};
