<template>
  <div>
    <h3>I'm the babysitter..</h3>
    <template v-for="(child, index) in children">
      <p>
        <slot name="child" :child="child"></slot>
        <button @click="clone(child)">Clone child</button>
      </p>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    children: {
      type: Array
    }
  },
  methods: {
    clone (child) {
      this.$emit('clone', child)
    }
  }
}
</script>
<style lang="scss" scoped>
  p * {
    display:inline-block;
  }
</style>
