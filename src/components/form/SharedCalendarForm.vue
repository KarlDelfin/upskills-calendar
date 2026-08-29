<template>
    <!-- SHARE CALENDAR DIALOG -->
    <el-dialog v-model="calendarStore.dialog.sharedCalendar" :title="calendarStore.title" center :before-close="calendarStore.clear" width="600">
        <el-tabs v-model="calendarStore.tab" class="demo-tabs" @tab-click="calendarStore.changeTab">
            <el-tab-pane label="Assign User" name="first">
                <el-form label-position="top">
                    <el-input placeholder="Search user email address" v-model="calendarStore.search.user" @input="calendarStore.searchUserByEmail"/>
                </el-form>
                    
                
                <!-- SHARED CALENDAR TABLE -->
                <el-table :data="calendarStore.users" v-loading="calendarStore.loading.sharedCalendar">
                    <el-table-column prop="email" label="Email"/>
                    <el-table-column label="Full Name">
                        <template #default="scope">
                            <p>{{ scope.row.full_name }}</p>
                        </template>
                    </el-table-column>
                    <el-table-column label="Operation" align="center">
                        <template #default="scope" >
                            <el-button @click="calendarStore.assignUser(scope.row.id)" type="primary" :loading="calendarStore.loading.sharedCalendar">Assign</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>

            <!-- SHARED USER -->
            <el-tab-pane label="Shared Users" name="second">
                <el-table :data="calendarStore.users" v-loading="calendarStore.loading.sharedCalendar">
                    <el-table-column label="Email" prop="email"/>
                    <el-table-column label="Full Name" prop="user_metadata.full_name"/>
                    <el-table-column label="Operation" align="center">
                        <template #default="scope" >
                            <el-button @click="calendarStore.unassignUser(scope.row.id)" type="danger" size="small">Remove</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>

<script lang="ts">
import { useCalendarStore } from '@/stores/useCalendarStore'

export default {
    setup() {
        const calendarStore = useCalendarStore()
        return { calendarStore }
    },
    data() {
        return {}
    }
}
</script>