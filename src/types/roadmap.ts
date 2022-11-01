export type RoadmapGoal = {
  roadmap_id: string;
  id: string;
  title: string;
  type: string;
  description: string;
  labels: string[];
  state: string;
  start_date: string;
  due_date: string;
  url: string;
};

export type RoadmapMilestone = {
  roadmap_id: string;
  id: string;
  title: string;
  type: string;
  description: string;
  goal_id: string;
  state: string;
  start_date: string;
  due_date: string;
  url: string;
};

export type RoadmapActivity = {
  roadmap_id: string;
  id: string;
  title: string;
  type: string;
  description: string;
  tasks_count: number;
  tasks_completed: number;
  labels: string[];
  milestone_id: string;
  goal_id: string;
  state: string;
  due_date: string;
  weight: number | null;
  url: string;
};
