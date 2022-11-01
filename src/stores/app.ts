import { defineStore } from 'pinia';
import {
  RoadmapActivity,
  RoadmapGoal,
  RoadmapMilestone,
} from 'src/types/roadmap';

export const useAppStore = defineStore('app', {
  state: () => ({
    selectedRoadmapItem: undefined as
      | RoadmapGoal
      | RoadmapActivity
      | RoadmapMilestone
      | undefined,
    roadmapGoals: [] as RoadmapGoal[],
    roadmapActivities: [] as RoadmapActivity[],
    roadmapMilestones: [] as RoadmapMilestone[],
    chartModeSelected: 'Goals' as string,
    chartModes: ['Goals', 'Roadmap Categories'] as string[],
    dateframeMin: Date.now() as number,
    dateframeMax: Date.now() as number,
  }),

  getters: {
    // interactions
    getSelectedRoadmapItem(
      state
    ): RoadmapGoal | RoadmapActivity | RoadmapMilestone | undefined {
      return state.selectedRoadmapItem;
    },

    isSelectedRoadmapItem(state): boolean {
      return state.selectedRoadmapItem != undefined;
    },

    getSelectedChartMode(state): string {
      return state.chartModeSelected;
    },

    getChartModes(state): string[] {
      return state.chartModes;
    },

    getMinDateframe(state): number {
      return state.dateframeMin;
    },

    getMaxDateframe(state): number {
      return state.dateframeMax;
    },

    // roadmap items
    getRoadmapGoals(state): RoadmapGoal[] {
      return state.roadmapGoals;
    },

    getRoadmapMilestones(state): RoadmapMilestone[] {
      return state.roadmapMilestones;
    },

    getRoadmapActivities(state): RoadmapActivity[] {
      return state.roadmapActivities;
    },
  },

  actions: {
    // interactions
    selectRoadmapItem(id: string | undefined): void {
      // unselect
      if (id == undefined) {
        this.selectedRoadmapItem = undefined;
        return;
      }

      // goal
      const goal: RoadmapGoal | undefined = this.roadmapGoals.find(
        (rg) => rg.roadmap_id == id
      );
      if (goal != undefined) {
        this.selectedRoadmapItem = goal;
        return;
      }

      // milestone
      const milestone: RoadmapMilestone | undefined =
        this.roadmapMilestones.find((rm) => rm.roadmap_id == id);
      if (milestone != undefined) {
        this.selectedRoadmapItem = milestone;
        return;
      }

      // activity
      const activity: RoadmapActivity | undefined = this.roadmapActivities.find(
        (ra) => ra.id == id
      );
      if (activity != undefined) {
        this.selectedRoadmapItem = activity;
        return;
      }
    },

    setChartMode(mode: string): void {
      if (mode.length == 0) return;
      if (!this.chartModes.includes(mode)) return;

      this.chartModeSelected = mode;
    },

    setMinDateframe(dateframe: number): void {
      this.dateframeMin = dateframe;
    },

    setMaxDateframe(dateframe: number): void {
      this.dateframeMax = dateframe;
    },

    // roadmap items
    setRoadmapGoals(goals: RoadmapGoal[]): void {
      this.roadmapGoals = goals;
    },

    setRoadmapMilestones(milestones: RoadmapMilestone[]): void {
      this.roadmapMilestones = milestones;
    },

    setRoadmapActivities(activities: RoadmapActivity[]): void {
      this.roadmapActivities = activities;
    },
  },
});
