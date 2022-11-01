<template>
  <q-page class="row justify-evenly">
    <div
      class="row q-gutter-sm justify-center items-center"
      style="height: 50px"
    >
      <q-btn-dropdown outline color="grey" label="Group By">
        <q-list>
          <q-item
            v-for="by in appStore.getChartModes"
            :key="by"
            clickable
            v-close-popup
            @click="appStore.setChartMode(by)"
          >
            <q-item-section>
              <q-item-label>{{ by }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-btn-dropdown outline color="grey" label="Content">
        <q-list>
          <q-item style="min-width: 300px">
            <q-item-section>
              <q-item-label>
                <div class="row justify-between items-center">
                  <div class="col text-overline">Dateframe</div>
                  <div class="col text-right">
                    <q-btn
                      flat
                      size="sm"
                      color="red-4"
                      icon="first_page"
                      @click="setFrom(minGoalDateframe)"
                      dense
                    />
                    <q-btn
                      flat
                      size="sm"
                      color="red-4"
                      @click="setFrom(Date.now())"
                      dense
                    >
                      <q-icon name="today" /><q-icon name="navigate_before" />
                    </q-btn>
                  </div>
                  <div class="col text-right">
                    <q-btn
                      flat
                      size="sm"
                      color="red-4"
                      @click="setTo(Date.now())"
                      dense
                    >
                      <q-icon name="navigate_next" /><q-icon name="today" />
                    </q-btn>
                    <q-btn
                      flat
                      size="sm"
                      color="red-4"
                      icon="last_page"
                      @click="setTo(maxGoalDateframe)"
                      dense
                    />
                  </div>
                </div>
              </q-item-label>
              <q-item-label>
                <q-range
                  class="q-mt-xl"
                  v-model="TimelineDateframe"
                  color="red-4"
                  label-always
                  :left-label-value="minDateframe"
                  :right-label-value="maxDateframe"
                  :min="minGoalDateframe"
                  :max="maxGoalDateframe"
                />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-btn
        v-if="appStore.isSelectedRoadmapItem"
        unelevated
        label="Details"
        color="red"
        @click="stateItemDetails = true"
      />
      <q-btn
        v-if="
          modeFocusGoal ||
          (appStore.isSelectedRoadmapItem &&
            appStore.getSelectedRoadmapItem.type == 'goal')
        "
        :outline="!modeFocusGoal"
        :unelevated="modeFocusGoal"
        :label="modeFocusGoal ? 'Show Overall' : 'Focus Roadmap Item'"
        color="red"
        @click="toggleModeFocusGoal"
      />
    </div>
    <my-view-table />
    <my-dialog-item-detail
      v-model:show="stateItemDetails"
      :item="appStore.getSelectedRoadmapItem"
    />
  </q-page>
</template>

<script setup lang="ts">
import MyDialogItemDetail from 'src/components/MyDialogItemDetail.vue';
import MyViewTable from 'src/components/MyViewTable.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useAppStore } from 'src/stores/app';
import { date } from 'quasar';

const appStore = useAppStore();

onMounted(() => {
  getRoadmapData();
});

const modeFocusGoal = ref<boolean>(false);
const showRoadmapGoalId = ref<string>('');
const showRoadmapType = ref<string[]>(['goal']);

const stateItemDetails = ref<boolean>(false);

const minGoalDateframe = ref<number>(Date.now());
const maxGoalDateframe = ref<number>(Date.now());

const minDateframe = computed<string>(() => {
  return date.formatDate(new Date(TimelineDateframe.value.min), 'DD. MMM YYYY');
});
const maxDateframe = computed<string>(() => {
  return date.formatDate(new Date(TimelineDateframe.value.max), 'DD. MMM YYYY');
});

const TimelineDateframe = computed<{ min: number; max: number }>({
  get() {
    return { min: appStore.getMinDateframe, max: appStore.getMaxDateframe };
  },
  set(value: { min: number; max: number }) {
    appStore.setMinDateframe(value.min);
    appStore.setMaxDateframe(value.max);
  },
});

async function getRoadmapData(): Promise<void> {
  try {
    await getRoadmapGoals();
    await getRoadmapMilestones();
    await getRoadmapActivities();
  } catch (error) {
    console.log(error);
  }
}

async function getRoadmapGoals(): Promise<void> {
  const goals = await getRoadmapItems('goals/');
  appStore.setRoadmapGoals(goals);

  getBorderDatesOfGoals();
  if (Date.now() > minGoalDateframe.value) appStore.setMinDateframe(Date.now());
  else appStore.setMinDateframe(minGoalDateframe.value);
  appStore.setMaxDateframe(maxGoalDateframe.value);
}
async function getRoadmapMilestones(): Promise<void> {
  const milestones = await getRoadmapItems('milestones/');
  appStore.setRoadmapMilestones(milestones);
}
async function getRoadmapActivities(): Promise<void> {
  const activities = await getRoadmapItems('activities/');
  appStore.setRoadmapActivities(activities);
}

async function getRoadmapItems(path: string): Promise<any> {
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  };

  const response = await fetch(
    'http://10.1.0.79/api/roadmap/' + path,
    requestOptions
  );
  const jsonData = await response.json();
  return jsonData;
}

function getBorderDatesOfGoals(): void {
  appStore.getRoadmapGoals.forEach((rg) => {
    const goalStart: number = new Date(rg.start_date).getTime() || Date.now();
    const goalEnd: number = new Date(rg.due_date).getTime() || Date.now();
    if (minGoalDateframe.value > goalStart) minGoalDateframe.value = goalStart;
    if (maxGoalDateframe.value < goalEnd) maxGoalDateframe.value = goalEnd;
  });
}

function setFrom(from: number): void {
  TimelineDateframe.value = {
    min: from,
    max: appStore.getMaxDateframe,
  };
}

function setTo(to: number): void {
  TimelineDateframe.value = {
    min: appStore.getMinDateframe,
    max: to,
  };
}

function toggleModeFocusGoal(): void {
  if (modeFocusGoal.value) {
    showRoadmapGoalId.value = '';
    showRoadmapType.value = ['goal'];
    modeFocusGoal.value = false;
    appStore.selectRoadmapItem(undefined);
  } else {
    if (!appStore.isSelectedRoadmapItem) return;
    if (appStore.getSelectedRoadmapItem != undefined) {
      if (appStore.getSelectedRoadmapItem.type != 'goal') return;
      showRoadmapGoalId.value = appStore.getSelectedRoadmapItem.roadmap_id;
    }
    showRoadmapType.value = ['goal', 'milestone', 'activity'];
    modeFocusGoal.value = true;
  }

  getRoadmapData();
}
</script>
