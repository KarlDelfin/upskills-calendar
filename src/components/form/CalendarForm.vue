<template>
    <el-dialog 
        :title="calendarStore.title" 
        v-model="calendarStore.dialog.calendar" 
        :before-close="calendarStore.clear"
        width="520px"
        class="custom-dialog rounded-xl overflow-hidden"
        destroy-on-close
        center
    >
        <el-form 
            ref="calendarFormRef" 
            :model="calendarStore.calendarForm" 
            v-loading="calendarStore.loading"
            label-position="top"
            class="pt-2"
        >
            <el-form-item 
                label="Product Name" 
                prop="name"
                :rules="[{ required: true, message: 'Please enter calendar name', trigger: 'blur' }]"
            >
                <el-input v-model="calendarStore.calendarForm.calendarName" placeholder="Enter calendar name"  />
            </el-form-item>

            <div class="flex justify-end pt-4 border-t border-slate-200 mt-6">
                <el-button 
                    @click="calendarStore.clear()" 
                    :loading="calendarStore.loading"
                >Cancel</el-button>
                <el-button 
                    type="primary"
                    class="custom-btn-primary" 
                    @click="handleConfirm()" 
                    :loading="calendarStore.loading"
                >
                    Confirm
                </el-button>
            </div>
        </el-form>
    </el-dialog>


  
</template>

<script lang="ts">
import { useCalendarStore } from '@/stores/useCalendarStore';

export default {
    setup() {
        const calendarStore = useCalendarStore()
        return { calendarStore }
    },
    data() {
        return {

        }
    },
    methods: {
        async handleConfirm() {
            const formEl = await this.$refs.calendarFormRef as any
            await formEl.validate()

            await this.calendarStore.submitForm()
        }
    }
}
</script>