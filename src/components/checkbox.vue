<script lang="ts" setup>
const { value, keyname, fill } = defineProps(['value', 'keyname', 'fill'])
const _value = ref(value)
const emit = defineEmits(['update:value'])

watch(_value, (v) => {
  console.log('checkbox,watch', v)
  if (value.constructor == Array) {
    emit('update:value', [...value, keyname])
  } else {
    emit('update:value', v)
  }
})
// :value="props.value" @click="e=>$emit('input',e.target.value)"
</script>
<template>
  <div class="checkbox-wrapper-43">
    <input v-model="_value" type="checkbox">
    <label @click="_value = !_value" class="check">
      <svg width="18px" height="18px" viewBox="0 0 18 18">
        <path
          d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z">
        </path>
        <polyline points="1 9 7 14 15 4"></polyline>
      </svg>
    </label>
  </div>
</template>
<style lang="less" scoped>
.checkbox-wrapper-43 {
  height: 1.1rem;
}

.checkbox-wrapper-43 input[type="checkbox"] {
  display: none;
  visibility: hidden;
}

.checkbox-wrapper-43 label {
  display: inline-block;
}

.checkbox-wrapper-43 .check {
  cursor: pointer;
  position: relative;
  margin: auto;
  width: 18px;
  height: 18px;
  -webkit-tap-highlight-color: transparent;
  transform: translate3d(0, 0, 0);
}

.checkbox-wrapper-43 .check:before {
  content: "";
  position: absolute;
  top: -15px;
  left: -15px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(34, 50, 84, 0.03);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.checkbox-wrapper-43 .check svg {
  position: relative;
  z-index: 1;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: #c8ccd4;
  stroke-width: 1.5;
  transform: translate3d(0, 0, 0);
  transition: all 0.2s ease;
}

.checkbox-wrapper-43 .check svg path {
  stroke-dasharray: 60;
  stroke-dashoffset: 0;
}

.checkbox-wrapper-43 .check svg polyline {
  stroke-dasharray: 22;
  stroke-dashoffset: 66;
}

.checkbox-wrapper-43 .check:hover:before {
  opacity: 1;
}

.checkbox-wrapper-43 .check:hover svg {
  stroke: #4285f4;
}

.checkbox-wrapper-43 input[type="checkbox"]:checked+.check svg {
  stroke: #4285f4;
}

.checkbox-wrapper-43 input[type="checkbox"]:checked+.check svg path {
  stroke-dashoffset: 60;
  transition: all 0.3s linear;
}

.checkbox-wrapper-43 input[type="checkbox"]:checked+.check svg polyline {
  stroke-dashoffset: 42;
  transition: all 0.2s linear;
  transition-delay: 0.15s;
}
</style>
  