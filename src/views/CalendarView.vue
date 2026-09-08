<template>
    <el-card class="border-0 rounded-xl overflow-hidden">
        <template #header>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-xl font-bold m-0">Calendar Management</h2>
                    <p class="text-xs m-0 mt-1">Manage and organize your calendar</p>
                </div>
            </div>
        </template>

        <div class="mb-6 flex justify-between w-full gap-3">
            <div class="w-full">
                <el-input
                    v-model="calendarStore.search.calendar"
                    @input="calendarStore.searchCalendar" 
                    placeholder="Search calendar by name..." 
                    :prefix-icon="Search"
                    clearable
                />
            </div>

            <div class="flex items-center justify-end">
                <el-button 
                    class="custom-btn-secondary"
                    @click="calendarStore.fetchCalendars()"
                    title="Refresh Data"
                    :loading="calendarStore.loading.calendar"
                >
                    <el-icon><Refresh /></el-icon>
                </el-button>
                <el-button 
                    class="custom-btn-primary flex items-center" 
                    @click="calendarStore.formController('Create Calendar', {})"
                    type="primary"
                >
                    <el-icon><Plus /></el-icon>
                    <span>Create Calendar</span>
                </el-button>
            </div>
        </div>

        <!-- TABLE -->
        <el-table 
            class="mb-6 rounded-lg overflow-hidden custom-table min-h-[540px]" 
            :data="calendarStore.calendars" 
            v-loading="calendarStore.loading.calendar"
        >
            <el-table-column prop="createdAt" label="Created At" align="left">
                <template #default="scope">
                    <span class="text-xs">{{ scope.row.dateTimeCreated }}</span>
                </template>
            </el-table-column>
        
            <el-table-column prop="name" label="Name">
                <template #default="scope">
                    <span class="font-semibold">{{ scope.row.calendarName }}</span>
                </template>
            </el-table-column>

            <el-table-column label="Share Calendar" align="center">
                <template #default="scope">
                    <el-button @click="calendarStore.formController('Shared Calendar', scope.row)" size="small"><el-icon class="mr-1"><User /></el-icon>View Users</el-button>
                </template>
            </el-table-column>

            <el-table-column label="Actions" width="160" fixed="right" align="center">
                <template #default="scope">
                    <div class="flex items-center justify-center">
                        <el-button 
                            size="small"
                            class="custom-btn-edit" 
                            @click="calendarStore.formController('Edit Calendar', scope.row)"
                        >
                            <el-icon class="mr-1"><Edit /></el-icon> Edit
                        </el-button>
                        <el-button 
                            size="small" 
                            type="danger" 
                            plain
                            @click="calendarStore.deleteCalendar(scope.row.calendarId)"
                        >
                            <el-icon class="mr-1"><Delete /></el-icon> Delete
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- PAGINATION -->
        <div class="flex justify-end pt-2">
            <el-pagination
                v-model:current-page="calendarStore.calendarPagination.currentPage"
                v-model:page-size="calendarStore.calendarPagination.elementsPerPage"
                :page-sizes="[5, 10, 25, 50]"
                :total="calendarStore.calendarPagination.totalElements"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="calendarStore.fetchCalendars()"
                @size-change="calendarStore.fetchCalendars()"
            />
        </div>
    </el-card>

    <CalendarForm />
    <SharedCalendarForm />
    
</template>

<script lang="ts">
import { useCalendarStore } from '@/stores/useCalendarStore'
import { markRaw } from 'vue'
import { Search } from '@element-plus/icons-vue'

import CalendarForm from '@/components/form/CalendarForm.vue';
import SharedCalendarForm from '@/components/form/SharedCalendarForm.vue';

export default {
    components: {
        Search: markRaw(Search),
        CalendarForm,
        SharedCalendarForm
    },
    setup() {
        const calendarStore = useCalendarStore()
        return { calendarStore }
    },
    data() {
        return {
            Search,
        }
    },
    mounted() {
        if(this.calendarStore.calendars.length === 0) {
            this.calendarStore.fetchCalendars()
        }
    }
}
</script>