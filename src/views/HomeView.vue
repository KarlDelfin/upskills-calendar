<template>

</template>

<script lang="ts">
import { markRaw } from 'vue'
import { Search } from '@element-plus/icons-vue'

export default {
    components: {
        Search: markRaw(Search)
    },
    setup() {
    },
    data() {
        return {
            Search,
        }
    },
    methods: {
        async handleConfirm() {
            const formEl = await this.$refs.productFormRef as any
            await formEl.validate()

        }
    },
   
}
</script>
