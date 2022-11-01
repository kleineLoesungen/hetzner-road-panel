<template>
  <q-input
    v-if="!Array.isArray(props.value) && props.options == undefined"
    outlined
    v-model="formValue"
    :label="props.label"
    :type="props.type"
    color="red-4"
    :autogrow="isAutogrow"
    :hint="hintText"
    :placeholder="props.placeholder"
    :dense="props.dense"
    :disable="props.disabled"
    debounce="2000"
  />
  <q-select
    v-if="!Array.isArray(props.value) && props.options != undefined"
    outlined
    color="red-4"
    v-model="formValue"
    :options="props.options"
    :label="props.label"
    :disable="props.disabled"
  />
  <q-list v-if="Array.isArray(props.value)" dense>
    <q-item v-for="val in props.value" :key="val">
      <q-item-section>- {{ val }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from 'vue';
//TODO: url -> link opener

interface ComponentProps {
  label: string;
  type: string;
  value: string | string[] | number;
  optional?: boolean;
  options?: string[];
  placeholder?: string;
  dense?: boolean;
  disabled?: boolean;
  hint?: string;
}
// valid types: "number" | "search" | "textarea" | "time" | "text" | "password" | "email" | "tel" | "file" | "url" | "date" | undefined

const props = defineProps<ComponentProps>();

const emits = defineEmits<{
  (e: 'update:value', value: string | string[] | number): void;
}>();

const formValue = computed<string | string[] | number>({
  get() {
    return props.value;
  },
  set(value: string | string[] | number) {
    emits('update:value', value);
  },
});

const isAutogrow = computed<boolean>(() => {
  return props.type == 'textarea';
});

const hintText = computed<string | undefined>(() => {
  if (props.hint) return props.hint;
  if (props.optional) return 'Optional';
  return undefined;
});
</script>
