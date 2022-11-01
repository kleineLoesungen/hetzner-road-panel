<template>
  <svg
    :viewBox="'0 0 ' + props.width + ' ' + props.height"
    :width="props.width"
    :height="props.height"
  >
    <g>
      <rect
        class="rect-back"
        :width="props.width"
        :height="props.height"
        x="0"
        y="0"
        :rx="props.height / 3"
        :ry="props.height / 3"
      />
    </g>
    <g :transform="'translate(' + rectStart + ',0)'">
      <rect
        :class="props.critical ? 'rect-front-negative' : 'rect-front-positive'"
        :width="rectLength"
        :height="props.height"
        :rx="props.height / 3"
        :ry="props.height / 3"
      />
      <g
        ref="label"
        :transform="'translate(' + textYPosition + ',' + textXPosition + ')'"
      >
        <text class="rect-text">{{ props.label }}</text>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { dom } from 'quasar';
import { computed, ref } from 'vue';

interface ComponentProps {
  width: number;
  height: number;
  minValue: number;
  maxValue: number;
  startValue: number;
  endValue: number;
  critical: boolean;
  label?: string;
}

const props = defineProps<ComponentProps>();

const { height, width } = dom;

const label = ref(null);

const textXPosition = computed<number>(() => {
  if (label.value != null) {
    const labelHeight = height(label.value);
    return props.height - labelHeight + labelHeight / 2;
  }
  return props.height / 2;
});

const textYPosition = computed<number>(() => {
  if (label.value != null) {
    const labelwidth = width(label.value);
    if (labelwidth > rectLength.value) return 10 - rectStart.value;
    return (rectLength.value - labelwidth) / 2;
  }
  return 10;
});

const rectLength = computed<number>(() => {
  // before timeline
  if (props.minValue > props.endValue) return 0;
  // after timeline
  if (props.maxValue < props.startValue) return 0;

  const maxTimeframe = props.maxValue - props.minValue;
  var rectTimeframe = props.endValue - props.startValue;
  // start before timeline
  if (props.startValue < props.minValue)
    rectTimeframe = props.endValue - props.minValue;

  // timeframe bigger than timeline
  if (rectTimeframe > maxTimeframe) return props.width;
  return (rectTimeframe / maxTimeframe) * props.width;
});

const rectStart = computed<number>(() => {
  // before timeline
  if (props.minValue > props.endValue) return 0;
  // after timeline
  if (props.maxValue < props.startValue) return 0;

  const maxTimeframe = props.maxValue - props.minValue;
  const startTimeframe = props.startValue - props.minValue;

  // start before timeline
  if (startTimeframe < 0) return 0;
  return (startTimeframe / maxTimeframe) * props.width;
});
</script>

<style lang="scss" scoped>
.rect-back {
  fill: $grey-2;
  stroke-width: 5;
}
.rect-front-positive {
  fill: $green-4;
  stroke-width: 5;
}
.rect-front-negative {
  fill: $red-4;
  stroke-width: 5;
}
.rect-text {
  fill: black;
  font-weight: 700;
}
</style>
