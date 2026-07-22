import { ReadingStory, type StoryStep } from './ReadingStory';

export function RepeatActionStory({
  storySteps,
  storyQuestion,
}: {
  storySteps?: StoryStep[];
  storyQuestion?: string;
}) {
  return <ReadingStory storySteps={storySteps ?? []} storyQuestion={storyQuestion ?? ''} />;
}
