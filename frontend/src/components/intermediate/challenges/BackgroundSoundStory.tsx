import { ReadingStory, type StoryStep } from './ReadingStory';

export function BackgroundSoundStory({
  storySteps,
  storyQuestion,
}: {
  storySteps?: StoryStep[];
  storyQuestion?: string;
}) {
  return <ReadingStory storySteps={storySteps ?? []} storyQuestion={storyQuestion ?? ''} />;
}
