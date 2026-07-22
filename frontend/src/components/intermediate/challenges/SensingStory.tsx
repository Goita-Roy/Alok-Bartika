import { ReadingStory, type StoryStep } from './ReadingStory';

export function SensingStory({
  storySteps,
  storyQuestion,
}: {
  storySteps?: StoryStep[];
  storyQuestion?: string;
}) {
  return <ReadingStory storySteps={storySteps ?? []} storyQuestion={storyQuestion ?? ''} />;
}
