<template>
<!-- SHARE CALENDAR DIALOG -->
    <el-dialog v-model="calendarStore.dialog.sharedCalendar" :title="calendarStore.dialog.title" center :before-close="calendarStore.clear" width="600">
        <el-tabs v-model="tab" class="demo-tabs" @tab-click="changeTab">
            <el-tab-pane label="Assign User" name="first">
                <el-form label-position="top">
                    <el-collapse accordion>
                        <el-collapse-item title="Filter Results" name="1">
                        <el-form>
                            <el-input placeholder="Search User" v-model="search.userEmail" />
                            <div class="search_con">
                                <el-button @click="clearSearch"> Reset </el-button>
                                <el-button type="primary" @click="getUsersByEmail" :loading="loading"> Apply </el-button>
                            </div>
                        </el-form>
                        </el-collapse-item>
                    </el-collapse>
                    </el-form>
                    
                
                    <!-- SHARED CALENDAR TABLE -->
                    <el-table :data="users" v-loading="loading">
                        <el-table-column prop="email" label="Email"/>
                        <el-table-column label="Full Name">
                            <template #default="scope">
                                <p>{{ scope.row.user_metadata.full_name }}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="Operation" align="center">
                            <template #default="scope" >
                                <el-button @click="assignUser(scope.row.id)" type="primary" :loading="loading">Assign</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- SHARED USER -->
                <el-tab-pane label="Shared Users" name="second">
                    <el-table :data="users" v-loading="loading">
                        <el-table-column label="Email" prop="email"/>
                        <el-table-column label="Full Name" prop="user_metadata.full_name"/>
                        <el-table-column label="Operation" align="center">
                            <template #default="scope" >
                                <el-button @click="unassignUser(scope.row.id)" type="danger">Remove</el-button>
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