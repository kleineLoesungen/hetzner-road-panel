import { RoadmapActivity, RoadmapGoal, RoadmapMilestone } from './roadmap';

export type RoadmapDataGoal = {
  group: string;
  values: RoadmapGoal[];
};

export type RoadmapDataMilestone = {
  group: string;
  values: RoadmapMilestone[];
};

export type RoadmapDataActivity = {
  group: string;
  values: RoadmapActivity[];
};
