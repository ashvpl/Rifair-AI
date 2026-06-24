export interface BehaviorAssessment {
  behavior_score: number; // 0-100
  availability_score: number; // 0-100
  activity_decay_factor: number; // 0-1 multiplier
}

export class BehaviorEngine {
  private static REFERENCE_DATE = new Date("2026-06-04");

  public static assess(candidate: any): BehaviorAssessment {
    const signals = candidate.redrob_signals || {};
    
    // 1. Calculate Recency Decay
    let daysSinceActive = 30; // default fallback
    if (signals.last_active_date) {
      const activeDate = new Date(signals.last_active_date);
      const diffTime = this.REFERENCE_DATE.getTime() - activeDate.getTime();
      daysSinceActive = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }

    let activity_decay_factor = 1.0;
    if (daysSinceActive > 7) {
      activity_decay_factor = Math.exp(-0.005 * (daysSinceActive - 7));
    }
    // Cap minimum decay factor at 0.1
    activity_decay_factor = Math.max(0.1, activity_decay_factor);

    // 2. Calculate Behavior Score
    let score = 50;

    // Response rate contribution
    const respRate = signals.recruiter_response_rate ?? 0;
    score += respRate * 15;

    // Response time contribution
    const respTime = signals.avg_response_time_hours ?? 168;
    if (respTime <= 24) {
      score += 10;
    } else if (respTime <= 72) {
      score += 5;
    } else if (respTime >= 168) {
      score -= 10;
    }

    // Interview completion
    const intComp = signals.interview_completion_rate ?? 0.5;
    if (intComp >= 0.8) {
      score += 10;
    } else if (intComp < 0.5) {
      score -= 15;
    }

    // Offer acceptance
    const offerAcc = signals.offer_acceptance_rate ?? -1;
    if (offerAcc >= 0.7) {
      score += 5;
    } else if (offerAcc >= 0 && offerAcc < 0.3) {
      score -= 5;
    }

    // Github activity
    const ghScore = signals.github_activity_score ?? -1;
    if (ghScore >= 50) {
      score += 10;
    } else if (ghScore >= 10) {
      score += 5;
    }

    // Saved by recruiters
    const savedCount = signals.saved_by_recruiters_30d ?? 0;
    score += Math.min(10, savedCount * 1.5);

    // Apply activity decay
    const behavior_score = Math.round(Math.max(0, Math.min(100, score)) * activity_decay_factor);

    // 3. Calculate Availability Score
    let availability = signals.open_to_work_flag ? 100 : 60;
    
    // Notice period adjustment
    const noticeDays = signals.notice_period_days ?? 60;
    if (noticeDays <= 30) {
      availability += 10;
    } else if (noticeDays >= 90) {
      availability -= 20;
    }

    const availability_score = Math.max(0, Math.min(100, availability));

    return {
      behavior_score,
      availability_score,
      activity_decay_factor
    };
  }
}
