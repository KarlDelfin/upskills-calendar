<template>  
    <el-dialog v-model="calendarEventStore.dialog.calendarEventForm" :title="calendarEventStore.dialog.title" center :before-close="calendarEventStore.clear" width="600">
    <el-form label-position="top">
      <el-form-item label="Calendar Name">
        <el-select v-model="calendarEventStore.sidebar.calendarId" disabled>
          <el-option v-for="calendar in calendarEventStore.calendars" :key="calendar.calendarId" :label="calendar.calendarName" :value="calendar.calendarId"/>
        </el-select>
      </el-form-item>
      <el-form-item label="Event Name">
        <el-input v-model="calendarEventStore.calendarEventForm.calendarEventName" type="text" placeholder="Event Name"/>
      </el-form-item>
      <el-form-item label="Event Description">
        <el-input v-model="calendarEventStore.calendarEventForm.calendarEventDescription" type="textarea" placeholder="Event Description"/>
      </el-form-item>
      
      <div class="flex_con">
        <el-form-item label="Event Color">
          <el-color-picker v-model="calendarEventStore.calendarEventForm.calendarEventColor" :predefine="calendarEventStore.predefineColors"/>
        </el-form-item>
        <el-form-item label="Is Recurring?">
          <el-radio-group v-model="calendarEventStore.calendarEventForm.isRecurring" @change="calendarEventStore.calendarEventForm.selectedRecurringDays = []">
            <el-radio label="Yes" :value="true" />
            <el-radio label="No" :value="false" />
          </el-radio-group>
        </el-form-item>
      </div>
      <el-divider content-position="left">Date Range</el-divider>
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
            <div class="flex_con">
              <el-input :value="inputValue.start" v-on="inputEvents.start" placeholder="Start Date"/>
              <el-input :value="inputValue.end" v-on="inputEvents.end" placeholder="End Date" />
            </div>
          </template>
        </VDatePicker>
      </el-form-item>
      <div class="flex_con">
        <el-form-item label="Start Time">
          <el-time-picker
            :disabled="calendarEventStore.dayClicked || calendarEventStore.weekClicked"
            format="HH:mm"
            v-model="calendarEventStore.calendarEventForm.startTime"
            placeholder="Start Time"
          />
        </el-form-item>
        <el-form-item label="End Time">
          <el-time-picker
            :disabled="calendarEventStore.dayClicked || calendarEventStore.weekClicked"
            format="HH:mm"
            v-model="calendarEventStore.calendarEventForm.endTime"
            placeholder="End Time"
          />
        </el-form-item>
      </div>

      <div v-if="calendarEventStore.calendarEventForm.isRecurring">
        <el-divider content-position="left">Recurring Every</el-divider>
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
      <div class="submit_btn">
        <el-button @click="calendarEventStore.submitForm" type="primary" :loading="calendarEventStore.loading">Confirm</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import { useCalendarEventStore } from '../../stores/useCalendarEventStore'

export default {
    setup() {
        const calendarEventStore = useCalendarEventStore()
        return { calendarEventStore }
    },
}
</script>