'use client';
// Dev harness — mounts the programs browse screens directly so the swipe
// gestures can be exercised without playing through the minigame first.
// Safe to delete; nothing in the flow imports it.
import { useState } from 'react';
import { getPrograms } from '../../../content/catalog';
import type { ScoredProgram } from '../../../content/recommend';
import type { ConditionId } from '../../../content/quiz';
import { CarouselPrograms } from '../../../landing/variants/programs/CarouselPrograms';
import { RelevantPrograms } from '../../../landing/variants/programs/RelevantPrograms';

export default function ProgramsGestureHarness() {
  const [screen, setScreen] = useState<'carousel' | 'relevant'>('carousel');

  const programs = getPrograms();
  const scored: ScoredProgram[] = programs.slice(0, 6).map((program, i) => ({
    program,
    score: 10 - i,
    matchedPrimary: program.primaryConditionIds.slice(0, 2) as ConditionId[],
    matchedSecondary: [],
  }));

  return (
    <div className="theme-blossom" style={{ position: 'relative' }}>
      <div
        style={{
          position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, display: 'flex', gap: 6, padding: 4,
          background: 'rgba(0,0,0,0.72)', borderRadius: 999,
        }}
      >
        {(['carousel', 'relevant'] as const).map(id => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            style={{
              padding: '4px 12px', borderRadius: 999, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: screen === id ? 'white' : 'transparent',
              color: screen === id ? 'black' : 'rgba(255,255,255,0.7)',
            }}
          >
            {id === 'carousel' ? 'Carousel' : 'Liên quan'}
          </button>
        ))}
      </div>

      {screen === 'carousel' ? (
        <CarouselPrograms
          suggestedPrograms={scored}
          allScoredPrograms={scored}
          onContinue={(id) => console.log('continue', id)}
        />
      ) : (
        <RelevantPrograms
          programs={scored}
          onContinue={(id) => console.log('continue', id)}
        />
      )}
    </div>
  );
}
