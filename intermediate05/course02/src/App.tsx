import { useState, useCallback, useRef } from 'react';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { DefinitionSection } from './components/DefinitionSection';
import { VisualLearning } from './components/VisualLearning';
import { ShapeDiscovery } from './components/ShapeDiscovery';
import { ScaffoldLearning } from './components/ScaffoldLearning';
import { Gamification } from './components/Gamification';
import { FlowchartGame } from './components/FlowchartGame';
import { Challenge } from './components/Challenge';
import { CauseEffectStory } from './components/CauseEffectStory';
import { ScratchBlockBuilder } from './components/ScratchBlockBuilder';
import { ScratchScaffold } from './components/ScratchScaffold';
import { ScratchChallenge } from './components/ScratchChallenge';
import { EventTriggerGame } from './components/EventTriggerGame';
import { DecisionStory } from './components/DecisionStory';
import { DecisionPathActivity } from './components/DecisionPathActivity';
import { LogicScaffold } from './components/LogicScaffold';
import { LogicChallenge } from './components/LogicChallenge';
import { LogicArchitectGame } from './components/LogicArchitectGame';
import { RepeatActionStory } from './components/RepeatActionStory';
import { LoopBlockExplorer } from './components/LoopBlockExplorer';
import { LoopsScaffold } from './components/LoopsScaffold';
import { LoopsChallenge } from './components/LoopsChallenge';
import { LoopRunnerGame } from './components/LoopRunnerGame';
import { ScoreboardStory } from './components/ScoreboardStory';
import { VariableBoxActivity } from './components/VariableBoxActivity';
import { VariablesScaffold } from './components/VariablesScaffold';
import { VariablesChallenge } from './components/VariablesChallenge';
import { VariableKeeperGame } from './components/VariableKeeperGame';
import { IfElseDecisionStory } from './components/IfElseDecisionStory';
import { IfElseBlockExplorer } from './components/IfElseBlockExplorer';
import { IfElseScaffold } from './components/IfElseScaffold';
import { IfElseChallenge } from './components/IfElseChallenge';
import { PasswordDefenderGame } from './components/PasswordDefenderGame';
import { lessonData, flowchartData, eventsData, programmingLogicData, loopsData, variablesData, ifElseData, operatorsData, sensingData, soundBackgroundData, LessonData } from './data/lessonData';
import { OperatorStory } from './components/OperatorStory';
import { OperatorExplorer } from './components/OperatorExplorer';
import { OperatorsScaffold } from './components/OperatorsScaffold';
import { OperatorMasterGame } from './components/OperatorMasterGame';
import { OperatorChallenge } from './components/OperatorChallenge';
import { SensingStory } from './components/SensingStory';
import { SensingExplorer } from './components/SensingExplorer';
import { SensingScaffold } from './components/SensingScaffold';
import { SensingMasterGame } from './components/SensingMasterGame';
import { SensingChallenge } from './components/SensingChallenge';
import { BackgroundSoundStory } from './components/BackgroundSoundStory';
import { BackdropSoundExplorer } from './components/BackdropSoundExplorer';
import { BackgroundSoundScaffold } from './components/BackgroundSoundScaffold';
import { SceneDirectorGame } from './components/SceneDirectorGame';
import { BackgroundSoundChallenge } from './components/BackgroundSoundChallenge';

const TOTAL_SECTIONS = 7;
const SECTION_IDS = ['hero', 'story', 'definition', 'visual', 'scaffold', 'game', 'challenge'];

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [currentClass, setCurrentClass] = useState<'class1'|'class2'|'class3'|'class4'|'class5'|'class6'|'class7'|'class8'|'class9'|'class10'>('class10');
  const sectionRefs = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_SECTIONS).fill(null));

  const data: LessonData = currentClass === 'class1' ? lessonData : currentClass === 'class2' ? flowchartData : currentClass === 'class3' ? eventsData : currentClass === 'class4' ? programmingLogicData : currentClass === 'class5' ? loopsData : currentClass === 'class6' ? variablesData : currentClass === 'class7' ? ifElseData : currentClass === 'class8' ? operatorsData : currentClass === 'class9' ? sensingData : soundBackgroundData;

  const handleStartLearning = useCallback(() => {
    const el = sectionRefs.current[1];
    el?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(1);
  }, []);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[index] = el;
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);

  const toggleClass = useCallback(() => {
    setCurrentClass((prev) => (prev === 'class1' ? 'class2' : prev === 'class2' ? 'class3' : prev === 'class3' ? 'class4' : prev === 'class4' ? 'class5' : prev === 'class5' ? 'class6' : prev === 'class6' ? 'class7' : prev === 'class7' ? 'class8' : prev === 'class8' ? 'class9' : prev === 'class9' ? 'class10' : 'class1'));
  }, []);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-text dark:text-text-dark transition-colors duration-300">
        {/* Top bar */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={toggleClass}
            className="w-auto px-4 h-12 rounded-full bg-card dark:bg-card-dark shadow-lg border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2 hover:border-primary transition-colors text-sm font-bold text-text dark:text-text-dark"
            aria-label="Toggle class"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {currentClass === 'class1' ? 'Class 02' : currentClass === 'class2' ? 'Class 03' : currentClass === 'class3' ? 'Class 04' : currentClass === 'class4' ? 'Class 05' : currentClass === 'class5' ? 'Class 06' : currentClass === 'class6' ? 'Class 07' : currentClass === 'class7' ? 'Class 08' : currentClass === 'class8' ? 'Class 09' : currentClass === 'class9' ? 'Class 10' : 'Class 01'}
          </button>
          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 rounded-full bg-card dark:bg-card-dark shadow-lg border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center hover:border-primary transition-colors"
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation dots */}
        <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
          {SECTION_IDS.map((id, i) => (
            <button
              key={id}
              onClick={() => {
                const el = sectionRefs.current[i];
                el?.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(i);
              }}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                activeSection === i
                  ? 'bg-primary border-primary scale-125'
                  : 'bg-transparent border-gray-400 dark:border-gray-500 hover:border-primary'
              }`}
              aria-label={`Go to section ${i + 1}`}
            />
          ))}
        </nav>

        {/* Sections */}
        <div ref={setRef(0)}>
          <Hero
            onStart={handleStartLearning}
            overallProgress={activeSection}
            totalSections={TOTAL_SECTIONS}
            lessonClass={data.class}
            lessonTitle={data.title}
            estimatedTime={data.estimatedTime}
            illustration={currentClass === 'class2' ? 'flowchart' : currentClass === 'class3' ? 'events' : currentClass === 'class4' ? 'logic' : currentClass === 'class5' ? 'loops' : currentClass === 'class6' ? 'variables' : currentClass === 'class7' ? 'ifelse' : currentClass === 'class8' ? 'operators' : currentClass === 'class9' ? 'sensing' : currentClass === 'class10' ? 'sound' : 'algorithm'}
          />
        </div>

        <div ref={setRef(1)} onMouseEnter={() => setActiveSection(1)}>
          {currentClass === 'class3' ? (
            <CauseEffectStory storySteps={data.storySteps} />
          ) : currentClass === 'class4' ? (
            <DecisionStory />
          ) : currentClass === 'class5' ? (
            <RepeatActionStory />
          ) : currentClass === 'class6' ? (
            <ScoreboardStory />
          ) : currentClass === 'class7' ? (
            <IfElseDecisionStory />
          ) : currentClass === 'class8' ? (
            <OperatorStory />
          ) : currentClass === 'class9' ? (
            <SensingStory />
          ) : currentClass === 'class10' ? (
            <BackgroundSoundStory />
          ) : (
          <StorySection
            storySteps={data.storySteps}
            storyQuestion={data.storyQuestion}
            correctOrder={data.correctOrder}
            badOrderMessage={data.badOrderMessage}
            goodOrderMessage={data.goodOrderMessage}
            usePictureCards={currentClass === 'class2'}
          />
          )}
        </div>

        <div ref={setRef(2)} onMouseEnter={() => setActiveSection(2)}>
          <DefinitionSection
            term={data.definition.term}
            fullText={data.definition.fullText}
            highlights={data.definition.highlights}
            illustration={currentClass === 'class2' ? 'flowchart' : currentClass === 'class3' ? 'events' : currentClass === 'class4' ? 'logic' : currentClass === 'class5' ? 'loops' : currentClass === 'class6' ? 'variables' : currentClass === 'class7' ? 'ifelse' : 'computer'}
          />
        </div>

        <div ref={setRef(3)} onMouseEnter={() => setActiveSection(3)}>
          {currentClass === 'class1' ? (
            <VisualLearning />
          ) : currentClass === 'class3' ? (
            <ScratchBlockBuilder />
          ) : currentClass === 'class4' ? (
            <DecisionPathActivity />
          ) : currentClass === 'class5' ? (
            <LoopBlockExplorer />
          ) : currentClass === 'class6' ? (
            <VariableBoxActivity />
          ) : currentClass === 'class7' ? (
            <IfElseBlockExplorer />
          ) : currentClass === 'class8' ? (
            <OperatorExplorer />
          ) : currentClass === 'class9' ? (
            <SensingExplorer />
          ) : currentClass === 'class10' ? (
            <BackdropSoundExplorer />
          ) : (
            <ShapeDiscovery />
          )}
        </div>

        <div ref={setRef(4)} onMouseEnter={() => setActiveSection(4)}>
          {currentClass === 'class3' ? (
            <ScratchScaffold />
          ) : currentClass === 'class4' ? (
            <LogicScaffold />
          ) : currentClass === 'class5' ? (
            <LoopsScaffold />
          ) : currentClass === 'class6' ? (
            <VariablesScaffold />
          ) : currentClass === 'class8' ? (
            <OperatorsScaffold />
          ) : currentClass === 'class9' ? (
            <SensingScaffold />
          ) : currentClass === 'class10' ? (
            <BackgroundSoundScaffold />
          ) : (
          <ScaffoldLearning
            phase1Title={data.scaffoldPhases.phase1.title}
            phase1Steps={data.scaffoldPhases.phase1.steps}
            phase2Title={data.scaffoldPhases.phase2.title}
            phase2Steps={data.scaffoldPhases.phase2.steps}
            phase2Activity2={data.scaffoldPhases.phase2Activity2}
          />
          )}
        </div>

        <div ref={setRef(5)} onMouseEnter={() => setActiveSection(5)}>
          {currentClass === 'class1' ? (
            <Gamification />
          ) : currentClass === 'class3' ? (
            <EventTriggerGame />
          ) : currentClass === 'class4' ? (
            <LogicArchitectGame />
          ) : currentClass === 'class5' ? (
            <LoopRunnerGame />
          ) : currentClass === 'class6' ? (
            <VariableKeeperGame />
          ) : currentClass === 'class8' ? (
            <OperatorMasterGame />
          ) : currentClass === 'class9' ? (
            <SensingMasterGame />
          ) : currentClass === 'class10' ? (
            <SceneDirectorGame />
          ) : (
            <FlowchartGame />
          )}
        </div>

        <div ref={setRef(6)} onMouseEnter={() => setActiveSection(6)}>
          {currentClass === 'class3' ? (
            <ScratchChallenge />
          ) : currentClass === 'class4' ? (
            <LogicChallenge />
          ) : currentClass === 'class5' ? (
            <LoopsChallenge />
          ) : currentClass === 'class6' ? (
            <VariablesChallenge />
          ) : currentClass === 'class8' ? (
            <OperatorChallenge />
          ) : currentClass === 'class9' ? (
            <SensingChallenge />
          ) : currentClass === 'class10' ? (
            <BackgroundSoundChallenge />
          ) : (
          <Challenge
            title={data.challenge.title}
            task={data.challenge.task}
            steps={data.challenge.steps}
            isFlowchart={currentClass === 'class2'}
          />
          )}
        </div>

        <footer className="py-8 text-center text-muted dark:text-muted-dark text-sm border-t border-gray-200 dark:border-gray-700">
          <p>{data.class} - {data.title} • Interactive Learning Experience</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
