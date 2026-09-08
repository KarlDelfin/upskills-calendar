<template>  
  <el-dialog 
    v-model="calendarEventStore.dialog.calendarEventForm" 
    :title="calendarEventStore.dialog.title" 
    center 
    :before-close="calendarEventStore.clear" 
    width="600px"
  >
    <el-form label-position="top" class="space-y-4">
      
      <!-- Calendar Name -->
      <el-form-item label="Calendar Name">
        <el-select 
          v-model="calendarEventStore.sidebar.calendarId" 
          disabled 
          class="w-full"
          :prefix-icon="Folder"
        >
          <el-option 
            v-for="calendar in calendarEventStore.calendars" 
            :key="calendar.calendarId" 
            :label="calendar.calendarName" 
            :value="calendar.calendarId"
          />
        </el-select>
      </el-form-item>

      <!-- Event Name -->
      <el-form-item label="Event Name">
        <el-input 
          v-model="calendarEventStore.calendarEventForm.calendarEventName" 
          type="text" 
          placeholder="Event Name"
          :prefix-icon="Edit"
        />
      </el-form-item>

      <!-- Event Description -->
      <el-form-item label="Event Description">
        <el-input 
          v-model="calendarEventStore.calendarEventForm.calendarEventDescription" 
          type="textarea" 
          :rows="3"
          placeholder="Event Description"
        />
      </el-form-item>
      
      <!-- Color & Recurring Row -->
      <div class="flex items-center justify-between gap-6 py-2">
        <el-form-item label="Event Color" class="!mb-0">
          <div class="flex items-center gap-2">
            <el-icon class="text-gray-500"><Brush /></el-icon>
            <el-color-picker 
              v-model="calendarEventStore.calendarEventForm.calendarEventColor" 
              :predefine="calendarEventStore.predefineColors"
            />
          </div>
        </el-form-item>

        <el-form-item label="Is Recurring?" class="!mb-0">
          <div class="flex items-center gap-2">
            <el-icon class="text-gray-500"><Refresh /></el-icon>
            <el-radio-group 
              v-model="calendarEventStore.calendarEventForm.isRecurring" 
              @change="calendarEventStore.calendarEventForm.selectedRecurringDays = []"
            >
              <el-radio label="Yes" :value="true" />
              <el-radio label="No" :value="false" />
            </el-radio-group>
          </div>
        </el-form-item>
      </div>

      <el-divider content-position="left">
        <span class="flex items-center gap-2 text-gray-600">
          <el-icon><Calendar /></el-icon> Date Range
        </span>
      </el-divider>

      <!-- Date Range Inputs -->
      <el-form-item label="Date Range">
        <VDatePicker
          :popover="calendarEventStore.popover"
          v-model.range="calendarEventStore.calendarEventForm.dateRange"
          :columns="2"
          :first-day-of-week="1"
          mode="date"
          :min-date="new Date()"
        >
          <template #default="{ inputValue, inputEvents }">
            <div class="flex items-center gap-4 w-full">
              <el-input 
                class="w-full" 
                :value="inputValue.start" 
                v-on="inputEvents.start" 
                placeholder="Start Date"
                :prefix-icon="Calendar"
              />
              <span class="text-gray-400">to</span>
              <el-input 
                class="w-full" 
                :value="inputValue.end" 
                v-on="inputEvents.end" 
                placeholder="End Date" 
                :prefix-icon="Calendar"
              />
            </div>
          </template>
        </VDatePicker>
      </el-form-item>

      <!-- Time Pickers Row -->
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="Start Time">
          <el-time-picker
            class="!w-full"
            :disabled="calendarEventStore.dayClicked || calendarEventStore.weekClicked"
            format="HH:mm"
            v-model="calendarEventStore.calendarEventForm.startTime"
            placeholder="Start Time"
            :prefix-icon="Clock"
          />
        </el-form-item>

        <el-form-item label="End Time">
          <el-time-picker
            class="!w-full"
            :disabled="calendarEventStore.dayClicked || calendarEventStore.weekClicked"
            format="HH:mm"
            v-model="calendarEventStore.calendarEventForm.endTime"
            placeholder="End Time"
            :prefix-icon="Clock"
          />
        </el-form-item>
      </div>

      <!-- Recurring Days Checklist -->
      <div v-if="calendarEventStore.calendarEventForm.isRecurring" class="pt-2">
        <el-divider content-position="left">
          <span class="flex items-center gap-2 text-gray-600">
            <el-icon><RefreshRight /></el-icon> Recurring Every
          </span>
        </el-divider>
        <div class="flex flex-wrap gap-2">
          <el-checkbox
            v-for="(day, index) in calendarEventStore.recurringDays"
            :key="index"
            @change="calendarEventStore.selectedRecurringDay(day.value)"
            :label="day.label"
            :value="day.value"
            size="large"
            :checked="day.checked"
            :disabled="day.disabled"
          >
            {{ day.label }}
          </el-checkbox>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end pt-4">
        <el-button 
          @click="calendarEventStore.submitForm" 
          type="primary" 
          :loading="calendarEventStore.loading"
          class="px-6"
        >
          Confirm
        </el-button>
      </div>

    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import { useCalendarEventStore } from '../../stores/useCalendarEventStore'
import { Folder, Edit, Brush, Refresh, Calendar, Clock, RefreshRight } from '@element-plus/icons-vue'

export default {
  components: { Folder, Edit, Brush, Refresh, Calendar, Clock, RefreshRight },
  setup() {
    const calendarEventStore = useCalendarEventStore()
    return { 
      calendarEventStore,
      Folder,
      Edit,
      Brush,
      Refresh,
      Calendar,
      Clock,
      RefreshRight
    }
  },
}
</script>