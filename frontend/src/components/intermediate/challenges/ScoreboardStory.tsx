import { ReadingStory, type StoryStep } from './ReadingStory';

export function ScoreboardStory({
  storySteps,
  storyQuestion,
}: {
  storySteps?: StoryStep[];
  storyQuestion?: string;
}) {
  return <ReadingStory storySteps={storySteps ?? []} storyQuestion={storyQuestion ?? ''} />;
}
