<template>
  <div>
    <h3>I'm a child and my name is {{ child.name }}!</h3>
    <input v-model="child.complaint" placeholder="speak your mind!" type="text" @input="complain">
  </div>
</template>
<script>
export default {
  props: ['child'],
  methods: {
    complain () {
      this.$emit('complain', { id: this.child.id, complaint: this.child.complaint })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
