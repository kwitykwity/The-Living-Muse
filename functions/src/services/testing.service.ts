import { GeminiPoemAdapter } from '../ai/gemini';
import * as logger from 'firebase-functions/logger';

/**
 * SoulTestingSuite — Phase 4: Reliability & Refinement.
 * Evaluates if the Muse's output matches the intended "Soul" (sentiment).
 */
export class SoulTestingSuite {
  private adapter = new GeminiPoemAdapter();

  /**
   * runAlignmentTest
   * Runs a batch of prompts and checks sentiment adherence.
   */
  async runAlignmentTest() {
    const scenarios = [
      { prompt: "A lonely lighthouse in a storm.", expectedSentiment: "melancholic" },
      { prompt: "A field of sunflowers in the morning sun.", expectedSentiment: "joyful" },
      { prompt: "A dragon guarding a mountain of gold.", expectedSentiment: "fierce" },
    ];

    logger.info("Starting Soul Alignment Test Suite...");
    
    const results = [];
    for (const scenario of scenarios) {
      const output = await this.adapter.generatePoem({
        context: "Soul alignment validation test",
        prompt: scenario.prompt
      });
      
      if (output.success) {
        const actualSentiment = output.data?.sentiment || 'unknown';
        const isAligned = actualSentiment === scenario.expectedSentiment;
        
        results.push({
          scenario: scenario.prompt,
          expected: scenario.expectedSentiment,
          actual: actualSentiment,
          score: output.data?.sentimentScore,
          isAligned
        });

        logger.info(`Result: ${scenario.prompt} -> ${actualSentiment} (${isAligned ? 'ALIGNED' : 'MISALIGNED'})`);
      }
    }

    const alignmentRate = (results.filter(r => r.isAligned).length / results.length) * 100;
    logger.info(`Soul Alignment Rate: ${alignmentRate}%`);
    
    return { results, alignmentRate };
  }
}
