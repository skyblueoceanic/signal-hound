import type { SourceType } from "../types";
import { VIRALITY_THRESHOLDS, VIRALITY_WEIGHTS } from "../types";
import {
  getRecentSnapshots,
  updateViralityScore,
  createAlert,
} from "../db/items";

interface ViralityResult {
  velocityScore: number;
  absoluteScore: number;
  combinedScore: number;
  isViral: boolean;
  velocity: number;
  acceleration: number;
}

export async function calculateVirality(
  itemId: number,
  sourceType: SourceType,
  currentScore: number,
  currentComments: number
): Promise<ViralityResult> {
  const snapshots = await getRecentSnapshots(itemId, 10);
  const thresholds = VIRALITY_THRESHOLDS[sourceType];

  // Default values if no history
  let velocity = 0;
  let acceleration = 0;
  let velocityScore = 0;
  let absoluteScore = 0;

  if (snapshots.length >= 2) {
    // Calculate velocity (change per minute)
    const latest = snapshots[0];
    const previous = snapshots[1];
    const timeDeltaMs =
      latest.recordedAt.getTime() - previous.recordedAt.getTime();
    const timeDeltaMin = Math.max(timeDeltaMs / 60000, 1); // at least 1 minute

    velocity = (latest.score - previous.score) / timeDeltaMin;

    // Calculate acceleration if we have enough data
    if (snapshots.length >= 3) {
      const prevPrevious = snapshots[2];
      const prevTimeDeltaMs =
        previous.recordedAt.getTime() - prevPrevious.recordedAt.getTime();
      const prevTimeDeltaMin = Math.max(prevTimeDeltaMs / 60000, 1);
      const prevVelocity =
        (previous.score - prevPrevious.score) / prevTimeDeltaMin;
      acceleration = (velocity - prevVelocity) / timeDeltaMin;
    }

    // Normalize velocity score (0-100 scale)
    if (thresholds.velocityPerMinute > 0) {
      velocityScore = Math.min(
        (velocity / thresholds.velocityPerMinute) * 50,
        100
      );
    }
  }

  // Calculate absolute score (0-100 scale)
  if (thresholds.absoluteScore > 0) {
    absoluteScore = Math.min(
      (currentScore / thresholds.absoluteScore) * 50,
      100
    );
  }
  if (thresholds.absoluteComments > 0) {
    const commentScore = Math.min(
      (currentComments / thresholds.absoluteComments) * 50,
      100
    );
    absoluteScore = Math.max(absoluteScore, commentScore);
  }

  // Combined score
  const combinedScore =
    VIRALITY_WEIGHTS.velocity * velocityScore +
    VIRALITY_WEIGHTS.absolute * absoluteScore;

  // Determine if viral (tight thresholds — only truly spiking content)
  const isViral =
    combinedScore >= 70 || // combined threshold (raised from 60)
    velocityScore >= 85 || // high velocity alone (raised from 80)
    absoluteScore >= 95; // high absolute alone (raised from 90)

  return {
    velocityScore,
    absoluteScore,
    combinedScore,
    isViral,
    velocity,
    acceleration,
  };
}

export async function processItemVirality(
  itemId: number,
  sourceType: SourceType,
  currentScore: number,
  currentComments: number,
  title: string
): Promise<ViralityResult> {
  const result = await calculateVirality(
    itemId,
    sourceType,
    currentScore,
    currentComments
  );

  // Update item with virality data
  await updateViralityScore(itemId, {
    viralityScore: result.combinedScore,
    isViral: result.isViral,
    velocity: result.velocity,
    acceleration: result.acceleration,
  });

  // Create alert if newly viral
  if (result.isViral) {
    if (result.velocityScore >= 70) {
      await createAlert(
        itemId,
        "velocity_spike",
        `Rapid engagement spike detected on "${title.slice(0, 80)}" - ${result.velocity.toFixed(1)} points/min`,
        result.combinedScore
      );
    }
    if (result.absoluteScore >= 80) {
      await createAlert(
        itemId,
        "absolute_threshold",
        `High engagement on "${title.slice(0, 80)}" - Score: ${currentScore}, Comments: ${currentComments}`,
        result.combinedScore
      );
    }
  }

  return result;
}
