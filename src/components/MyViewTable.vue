<template>
  <div class="Column q-pa-md items-start" style="width: 100%">
    <q-tree :nodes="nodeTree" node-key="title">
      <template v-slot:default-header="prop">
        <div class="row justify-between" style="width: 100%">
          <div class="col-auto">
            <q-icon
              v-if="prop.node.type == 'group'"
              name="view_agenda"
              color="red"
              class="q-mr-sm"
            />
            <q-icon
              v-if="prop.node.type == 'goal'"
              name="crisis_alert"
              color="red"
              class="q-mr-sm"
            />
            <q-icon
              v-if="prop.node.type == 'activity'"
              name="fact_check"
              color="red"
              class="q-mr-sm"
            />
            <q-icon
              v-if="prop.node.type == 'milestone'"
              name="emoji_events"
              color="red"
              class="q-mr-sm"
            />
          </div>
          <div class="col">
            <div class="row text-h6">
              {{ prop.node.title }}
            </div>
          </div>
          <div class="col">
            <div
              v-if="prop.node.type != 'group'"
              class="row items-center justify-end"
            >
              <q-chip
                v-if="prop.node.progress != undefined"
                icon="published_with_changes"
                >{{ parseFloat(prop.node.progress).toFixed(0) + '%' }}</q-chip
              >
              <q-chip
                v-if="prop.node.weight != undefined"
                icon="fitness_center"
                >{{ prop.node.weight == null ? '1' : prop.node.weight }}</q-chip
              >
              <q-chip
                v-if="prop.node.tasks_count != undefined"
                icon="checklist"
                >{{
                  prop.node.tasks_completed + '/' + prop.node.tasks_count
                }}</q-chip
              >
              <q-icon
                v-if="
                  prop.node.progress == undefined &&
                  prop.node.tasks_completed == prop.node.tasks_count &&
                  prop.node.state != 'closed'
                "
                name="contact_support"
                color="grey"
              />
              <my-item-timeline
                width="400"
                height="25"
                :start-value="
                  new Date(prop.node.start_date).getTime() || Date.now()
                "
                :end-value="
                  new Date(prop.node.due_date).getTime() || Date.now()
                "
                :min-value="appStore.getMinDateframe"
                :max-value="appStore.getMaxDateframe"
                :critical="!prop.node.inTime"
              />
              <q-tooltip class="bg-grey-4 text-body2 text-black">{{
                date.formatDate(prop.node.start_date, 'DD. MMM YYYY') +
                ' - ' +
                date.formatDate(prop.node.due_date, 'DD. MMM YYYY')
              }}</q-tooltip>
              <q-btn
                flat
                icon="launch"
                label="GitLab"
                @click="openURL(prop.node.url)"
                dense
              />
            </div>
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup lang="ts">
import MyItemTimeline from 'src/components/MyItemTimeline.vue';
import { useAppStore } from 'src/stores/app';
import {
  RoadmapActivity,
  RoadmapGoal,
  RoadmapMilestone,
} from 'src/types/roadmap';
import { computed } from 'vue';
import { date } from 'quasar';

const appStore = useAppStore();

interface TreeElement {
  title: string;
  type: string;
  labels?: string[];
  children: TreeElement[];
  inTime?: boolean;
}

const nodeTree = computed<TreeElement[]>(() => {
  var tree: TreeElement[] = appStore.getRoadmapGoals.map((rg) => {
    // definition goal progress
    const goalTasks: {
      weighted_count: number;
      weighted_completed: number;
    } = { weighted_count: 0, weighted_completed: 0 };

    // goal milestones
    const goalMilestones: TreeElement[] = appStore.getRoadmapMilestones
      .filter((rm) => rm.goal_id == rg.roadmap_id)
      .map((rm) => {
        // definition milestone progress
        const milestoneTasks: {
          weighted_count: number;
          weighted_completed: number;
        } = { weighted_count: 0, weighted_completed: 0 };

        // milestone activities
        const milestoneActivities: TreeElement[] = appStore.getRoadmapActivities
          .filter((mra) => mra.milestone_id == rm.roadmap_id)
          .map((mra) => {
            const milestone: RoadmapMilestone | undefined =
              appStore.getRoadmapMilestones.find(
                (rm) => rm.roadmap_id == mra.milestone_id
              );

            // milestone progress based on activities
            milestoneTasks.weighted_count +=
              ((mra.weight != null && mra.weight) || 1) * mra.tasks_count;
            if (mra.state == 'closed')
              milestoneTasks.weighted_completed +=
                ((mra.weight != null && mra.weight) || 1) * mra.tasks_count;
            else
              milestoneTasks.weighted_completed +=
                ((mra.weight != null && mra.weight) || 1) * mra.tasks_completed;

            // milestone activity table tree
            if (milestone == undefined)
              return { ...mra, children: [], inTime: false };
            if (mra.due_date == null)
              return { ...mra, children: [], inTime: false };
            return {
              ...mra,
              children: [],
              inTime:
                new Date(milestone.due_date).getTime() >
                new Date(mra.due_date).getTime(),
            };
          });

        // goal progress based on milestone progress
        goalTasks.weighted_count += milestoneTasks.weighted_count;
        if (rm.state == 'closed')
          goalTasks.weighted_completed += milestoneTasks.weighted_count;
        else goalTasks.weighted_completed += milestoneTasks.weighted_completed;

        // milestone table tree
        if (rm.due_date == null)
          return {
            ...rm,
            children: milestoneActivities,
            inTime: false,
            progress:
              (milestoneTasks.weighted_completed /
                ((milestoneTasks.weighted_count != 0 &&
                  milestoneTasks.weighted_count) ||
                  1)) *
              100,
          };

        // milestone activities in time
        const allActivitiesInTime: boolean =
          milestoneActivities.filter((ma) => !ma.inTime).length == 0;

        return {
          ...rm,
          children: milestoneActivities,
          inTime:
            allActivitiesInTime &&
            new Date(rg.due_date).getTime() > new Date(rm.due_date).getTime(),
          progress:
            (milestoneTasks.weighted_completed /
              ((milestoneTasks.weighted_count != 0 &&
                milestoneTasks.weighted_count) ||
                1)) *
            100,
        };
      });

    // goal activities
    const goalActivities: TreeElement[] = appStore.getRoadmapActivities
      .filter((ra) => ra.goal_id == rg.roadmap_id)
      .map((ra) => {
        // goal progress based activities
        goalTasks.weighted_count +=
          ((ra.weight != null && ra.weight) || 1) * ra.tasks_count;
        if (ra.state == 'closed')
          goalTasks.weighted_completed +=
            ((ra.weight != null && ra.weight) || 1) * ra.tasks_count;
        else
          goalTasks.weighted_completed +=
            ((ra.weight != null && ra.weight) || 1) * ra.tasks_completed;

        // goal activity table tree
        if (ra.due_date == null)
          return {
            ...ra,
            children: [],
            inTime: false,
          };
        return {
          ...ra,
          children: [],
          inTime:
            new Date(rg.due_date).getTime() > new Date(ra.due_date).getTime(),
        };
      });

    // goal milestones & activities
    const goalSubItems: TreeElement[] = goalMilestones.concat(goalActivities);

    // goal progress based on status
    if (rg.state == 'closed')
      goalTasks.weighted_completed = goalTasks.weighted_count;

    // goal activities in time
    const allActivitiesInTime: boolean =
      goalSubItems.filter((gi) => !gi.inTime).length == 0;

    // goal table tree
    return {
      ...rg,
      children: goalSubItems,
      inTime: allActivitiesInTime && rg.due_date != undefined,
      progress:
        (goalTasks.weighted_completed /
          ((goalTasks.weighted_count != 0 && goalTasks.weighted_count) || 1)) *
        100,
    };
  });

  tree = groupByRoadmapCategories(tree);

  return tree;
});

function groupByRoadmapCategories(tree: TreeElement[]): TreeElement[] {
  if (appStore.getSelectedChartMode != 'Roadmap Categories') return tree;

  const groupTree: TreeElement[] = [];
  tree.forEach((tg) => {
    var roadmapCategory = 'Others';
    if (tg.labels != undefined)
      roadmapCategory =
        tg.labels.find((l) => l.includes('Roadmap::')) || 'Others';
    const groupIndex: number = groupTree.findIndex(
      (g) => g.title == roadmapCategory
    );
    if (groupIndex > -1) {
      const newChildren: TreeElement[] = groupTree[groupIndex].children;
      newChildren.push(tg);
      groupTree.splice(groupIndex, 1, {
        title: roadmapCategory,
        type: 'group',
        children: newChildren,
      });
    } else
      groupTree.push({
        title: roadmapCategory,
        type: 'group',
        children: [tg],
      });
  });

  return groupTree;
}

function openURL(url: string): void {
  window.open(url, '_blank')?.focus();
}
</script>
