<template>
  <q-dialog v-model="showDialog">
    <q-card>
      <q-card-section>
        <div class="text-overline">Roadmap Item</div>
        <div class="text-h6">{{ props.item.title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div
          class="column q-gutter-sm"
          v-if="props.item != undefined"
          style="width: 500px"
        >
          <div
            class="col"
            v-for="prop in Object.keys(props.item)"
            :key="prop.roadmap_id"
          >
            <my-user-form
              :label="prop"
              :type="getFormType(prop)"
              :value="props.item[prop] != null ? props.item[prop] : 'unknown'"
              :disabled="true"
              dense
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="red" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import MyUserForm from 'src/components/MyUserForm.vue';
import { RoadmapGoal } from 'src/types/roadmap';
import { computed } from 'vue';

interface ComponentProps {
  show: boolean;
  item: RoadmapGoal | undefined;
}

const props = defineProps<ComponentProps>();

const emits = defineEmits<{
  (e: 'update:show', show: boolean): void;
}>();

const showDialog = computed<boolean>({
  get() {
    return props.show;
  },
  set(value: boolean) {
    emits('update:show', value);
  },
});

function getFormType(prop: string): string {
  if (prop == 'description') return 'textarea';
  if (prop == 'id') return 'number';
  if (prop == 'url') return 'url';
  return 'text';
}
</script>
