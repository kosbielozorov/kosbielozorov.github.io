import type {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';

type SlowStep = {
  count: number;
  name: string;
  location: string;
  duration: number;
};

const TOP_SLOWEST = 10;

/**
 * Prints the slowest `test.step()` calls after a run — the quickest way to spot
 * waits and setup worth removing. Wired in `playwright.config.ts`.
 */
class SlowStepReporter implements Reporter {
  private readonly steps: SlowStep[] = [];

  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category !== 'test.step') return;

    const name = step.titlePath().join('->');
    const alreadyReported = this.steps.find(s => s.name === name);

    if (alreadyReported) {
      alreadyReported.count += 1;
      return;
    }

    this.steps.push({
      count: 1,
      name,
      location: `${step.location?.file}:${step.location?.line}`,
      duration: step.duration,
    });
  }

  onEnd(): void {
    if (this.steps.length === 0) return;

    // Slowest first, top N only.
    const slowest = [...this.steps]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, TOP_SLOWEST);

    /* eslint-disable no-console */
    console.warn(`TOP-${TOP_SLOWEST} slowest steps`);
    console.table(slowest);
    /* eslint-enable no-console */
  }
}

export default SlowStepReporter;
