<template>
<div class="flex justify-center items-center">
  <el-empty
    :image-size="200"
    description="Looks like the page your are looking for does not exist"
  ><el-button class="!mx-auto flex justify-center items-center" @click="gotoIndex" type="primary">Go to Home</el-button></el-empty>
  
</div>
</template>

<script lang="ts">
export default {
  data() {
    return {}
  },

  methods: {
    gotoIndex() {
      this.$router.push('/')
    },
  },
}
</script>