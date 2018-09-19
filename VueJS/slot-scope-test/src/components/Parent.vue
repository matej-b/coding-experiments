<template>
  <div>
    <h2>I'm the parent! I have {{ childrenCount }} children...</h2>
    <div>
      <p v-for="child in children">
        <span class="name">{{ child.name }}</span>
        <span class="complaint" v-if="child.complaint !== ''"> ... is saying {{ child.complaint }}</span>
      </p>
    </div>
    <babysitter :children="children" @clone="handleClone($event)">
      <template  slot-scope="props" slot="child">
        <child :child="props.child" @complain="handleComplaint($event)"></child>
      </template>
    </babysitter>
  </div>
</template>
<script>
import Babysitter from '@/components/Babysitter'
import Child from '@/components/Child'

export default {
  data: () => ({
    children: [
      { id: 1, name: 'Jack', complaint: ''},
      { id: 2, name: 'Cathy', complaint: ''},
      { id: 3, name: 'Lucy', complaint: ''}
    ]
  }),
  components: {
    Babysitter,
    Child
  },
  computed: {
    childrenCount() {
      return this.children.length
    }
  },
  methods: {
    handleComplaint (childComplaint) {
      this.children.find((child) => {
        console.log(child.id);
        console.log(childComplaint);
        if (childComplaint.id === child.id){
          this.child.complaint = childComplaint.complaint
        }
      })
    },
    handleClone (child) {
      this.children.splice(this.childrenCount, 0, { name: `${child.name}'s clone`, complaint: ''})
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
