<template>
  <div class="flex gap-3 min-h-[88vh]">
    <el-card class="!w-[20%]" body-class="flex flex-col gap-3">
      <div class="w-full">
        <el-button class="w-full" @click="$router.push('/calendar')">Calendars</el-button>
      </div>

      <div class="w-full">
        <VCalendar 
          :key="calendarEventStore.pickerKey"
          style="width: 100%"
          v-model="calendarEventStore.today"
          @dayclick="dayClick"
          @did-move="didMove"
          :attributes="calendarEventStore.attributes"
        />
      </div>

      <div class="w-full">
        <el-button class="w-full" @click="calendarEventStore.formController('Create Calendar')" type="primary">Create Calendar</el-button>
      </div>

      <div class="flex flex-col gap-3">
        <el-select 
          v-model="calendarEventStore.sidebar.calendarId" 
          :loading="calendarEventStore.loading" 
          @click="calendarEventStore.getCalendarsByUserId" 
          @change="calendarEventStore.getCalendarEventsByCalendarId" 
          placeholder="Select Calendar"
        >
          <el-option 
            v-for="calendar in calendarEventStore.calendars" 
            :key="calendar.calendarId" 
            :label="`${calendar.calendarName} | ${'createdByUser' in calendar ? calendar.createdByUser : ''}`" 
            :value="calendar.calendarId"
          />
        </el-select>
        <el-select 
          v-model="calendarEventStore.sidebar.sharedCalendarId" 
          :loading="calendarEventStore.loading" 
          @click="calendarEventStore.getSharedCalendarsByUserId" 
          @change="calendarEventStore.getCalendarEventsByCalendarId" 
          placeholder="Select Shared Calendar"
        >
          <el-option 
            v-for="calendar in calendarEventStore.calendars" 
            :key="calendar.calendarId" 
            :label="`${calendar.calendarName} | ${'ownerFullName' in calendar ? calendar.ownerFullName : ''}`" 
            :value="calendar.calendarId"
          />
        </el-select>
      </div>

      <div class="w-full">
        <el-checkbox 
          v-for="calendarEvent in calendarEventStore.calendarEvents" 
          :key="calendarEvent.calendarEventId"
          v-model="calendarEventStore.selectedCalendarEvent[calendarEvent.calendarEventId!]"
          :label="calendarEvent.calendarEventName" 
          :value="calendarEvent.calendarEventId" 
          @change="handleCheckboxChange(calendarEvent.calendarEventId!, calendarEvent.calendarEventGroupId!)"
          size="large" 
          :checked="true"
        />
      </div>

      <div class="w-full flex justify-between">
        <el-button class="w-full" @click="checkAllEvents">Select All</el-button>
        <el-button class="w-full" @click="uncheckAllEvents">Select None</el-button>
      </div>
    </el-card>

    <el-card class="w-full">
      <FullCalendar class="fullCalendar" ref="refCalendar" :options="calendarOptions" />
    </el-card>
  </div>

  <!-- CALENDAR FORM -->
  <CalendarForm />
  
  <!-- CALENDAR EVENT FORM -->
  <CalendarEventForm/>

<!-- RECURRING EVENT CONFIRMATION DIALOG -->
  <el-dialog
    v-model="calendarEventStore.dialog.calendarEventConfirmation"
    :title="calendarEventStore.dialog.title"
    width="500"
    center
    :before-close="calendarEventStore.clear"
  >
    <div class="flex justify-center mt-3">
      <span>This is one activity in a series. What do you want to open?</span>
    </div>
    <div class="pt-3 flex justify-center text-center text-sm">
      <el-radio-group v-model="calendarEventStore.operationForm.isSeries" class="ml-4">
        <el-radio label="Just this one" :value="false" size="large" />
        <el-radio label="The entire series" :value="true" size="large" />
      </el-radio-group>
    </div>

    <template #footer>
      <div class="dialog-footer flex justify-end">
        <el-button type="primary" @click="calendarEventStore.formController('Event Details')">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- CALENDAR EVENT OPERATION -->
  <el-dialog
    v-model="calendarEventStore.dialog.recurringEventOperation"
    :title="calendarEventStore.dialog.title"
    width="500"
    center
  >
    <div class="border p-3">
      <label class="font-bold">Event Name: </label>
      {{ calendarEventStore.calendarEventForm.calendarEventName }}
      <br />
      <label class="font-bold mt-3 inline-block">Description: </label>
      {{ calendarEventStore.calendarEventForm.calendarEventDescription }}
      <br />
      <label class="font-bold mt-3 inline-block">Date/Time Start: </label>
      {{ calendarEventStore.calendarEventForm.dateTimeStartedDetails }}
      <br />
      <label class="font-bold mt-3 inline-block">Date/Time End: </label>
      {{ calendarEventStore.calendarEventForm.dateTimeEndedDetails }}
    </div>

    <template #footer>
      <div class="dialog-footer flex justify-end">
        <el-button 
          v-if="calendarEventStore.calendarEventForm.userId === currentUserId" 
          @click="calendarEventStore.calendarEventForm.isRecurring ? calendarEventStore.formController('Edit Recurring Event') : calendarEventStore.formController('Edit Non-Recurring Event')"
        > 
          Edit 
        </el-button>
        <el-button 
          v-if="calendarEventStore.calendarEventForm.userId === currentUserId" 
          type="danger" 
          @click="calendarEventStore.deleteCalendarEvent()"
        > 
          Delete 
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCalendarEventStore } from '../stores/useCalendarEventStore'
import { supabase } from '../utils/supabaseClient'
import FullCalendar from '@fullcalendar/vue3'
import rrulePlugin from '@fullcalendar/rrule'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import list from '@fullcalendar/list'
import { ElMessage } from 'element-plus'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import * as bootstrap from 'bootstrap'
import type { CalendarOptions } from '@fullcalendar/core'
import CalendarForm from '@/components/form/CalendarForm.vue'
import CalendarEventForm from '@/components/form/CalendarEventForm.vue'
export default defineComponent({
  name: 'HomeView',
  components: { FullCalendar, CalendarForm, CalendarEventForm },
  
  setup() {
    const calendarEventStore = useCalendarEventStore()
    return { calendarEventStore }
  },

  data() {
    return {
      currentUserId: '' as string,
      calendarApi: null as any,
    }
  },

  computed: {
    /* FULLCALENDAR CONFIGURATION */
    calendarOptions(): CalendarOptions {
      return {
        datesSet: (info) => {
          const currentDate = info.view.activeStart

          this.calendarEventStore.currentStartDateTime = moment(info.view.activeStart).format()
          this.calendarEventStore.currentEndDateTime = moment(info.view.activeEnd).subtract(1, 'days').format()

          this.calendarEventStore.firstDayOfMonth = moment(currentDate).startOf('month').format()
          this.calendarEventStore.lastDayOfMonth = moment(currentDate).endOf('month').format()

          this.calendarEventStore.currentMonth = moment(info.view.activeStart).format('MM')
          this.calendarEventStore.currentYear = moment(info.view.activeStart).format('YYYY')
        },

        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false,
        },

        eventDidMount: (info) => {
          const description = info.event.extendedProps.calendarEventDescription
          const startTime = info.event.extendedProps.startTime
          const endTime = info.event.extendedProps.endTime
          return new bootstrap.Popover(info.el, {
            title: info.event.title,
            placement: 'auto',
            trigger: 'hover',
            customClass: 'popoverStyle',
            content: `
                <span class="fst-italic">${description}</span>
                <hr>
                <div class="d-flex justify-content-center">
                  <small class='fw-bold'>${startTime} - ${endTime}</small>
                </div>
            `,
            html: true,
          })
        },

        views: {
          dayGridMonth: {
            dayMaxEventRows: 2,
            titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
          },
          timeGridWeek: {
            slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
          },
          timeGridDay: {
            slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
          },
          listMonth: {
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
          },
        },

        headerToolbar: {
          start: 'todayCustom,prevCustom,nextCustom',
          center: 'title',
          end: 'createEvent monthCustom,weekCustom,dayCustom,listCustom',
        },

        customButtons: {
          createEvent: {
            text: 'Create Event',
            click: () => this.calendarEventStore.formController('Create Event'),
          },
          todayCustom: {
            text: 'today',
            click: () => {
              this.calendarEventStore.pickerKey++
              this.calendarEventStore.today = new Date()
              this.calendarApi.today()
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
          prevCustom: {
            text: 'prev',
            click: () => {
              this.calendarEventStore.pickerKey++
              this.calendarApi.prev()
              const currentDate = moment(this.calendarApi.getDate()).format()
              this.calendarApi.gotoDate(currentDate)
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
          nextCustom: {
            text: 'next',
            click: () => {
              this.calendarEventStore.pickerKey++
              this.calendarApi.next()
              const currentDate = moment(this.calendarApi.getDate()).format()
              this.calendarApi.gotoDate(currentDate)
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
          monthCustom: {
            text: 'month',
            click: () => {
              this.calendarEventStore.weekClicked = false
              this.calendarEventStore.dayClicked = false
              this.calendarApi.changeView('dayGridMonth')
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
          weekCustom: {
            text: 'week',
            click: () => {
              this.calendarEventStore.weekClicked = true
              this.calendarEventStore.dayClicked = false
              this.calendarApi.changeView('timeGridWeek')
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
          dayCustom: {
            text: 'day',
            click: () => {
              this.calendarEventStore.weekClicked = false
              this.calendarEventStore.dayClicked = true
              this.calendarApi.changeView('timeGridDay')
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
          listCustom: {
            text: 'list',
            click: () => {
              this.calendarApi.changeView('listMonth')
              this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
            },
          },
        },
        height: 600,
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, list, rrulePlugin],
        timeZone: 'UTC',
        events: this.mapCalendarEventsToFullCalendar(this.calendarEventStore.rawCalendarEvents),
        firstDay: 0,
        initialView: 'dayGridMonth',
        eventDrop: this.moveResizeEvent,
        eventResize: this.moveResizeEvent,
        selectable: true,
        editable: true,
        eventResizableFromStart: true,
        droppable: true,
        select: this.handleDateRange,
        eventClick: this.eventClick,
        allDaySlot: false,
        eventLongPressDelay: 200,
        eventOverlap: true,
        forceEventDuration: true,
        displayEventTime: true,
        showNonCurrentDates: false,
      }
    },
  },

  methods: {
    /* MAP SUPABASE EVENTS TO FULLCALENDAR EVENT OBJECTS */
    mapCalendarEventsToFullCalendar(eventsData: any[]) {
      return eventsData.map((event) => ({
        title: event.calendarEventName,
        start: event.dateTimeStarted,
        end: moment(event.dateTimeEnded).add(1, 'days').format(),
        color: event.calendarEventColor,
        extendedProps: {
          userId: event.userId,
          calendarEventId: event.calendarEventId,
          calendarId: event.calendarId,
          calendarEventName: event.calendarEventName,
          calendarEventDescription: event.calendarEventDescription,
          calendarEventColor: event.calendarEventColor,
          isRecurring: event.isRecurring,
          calendarEventGroupId: event.calendarEventGroupId,
          startTime: moment(event.dateTimeStarted).format('HH:mm:ss'),
          endTime: moment(event.dateTimeEnded).format('HH:mm:ss'),
          dateTimeStarted: moment(event.dateTimeStarted).format(),
          dateTimeEnded: moment(event.dateTimeEnded).format(),
        },
        allDay:
          this.calendarApi?.view?.type !== 'timeGridWeek' &&
          this.calendarApi?.view?.type !== 'timeGridDay',
        rrule: event.isRecurring
          ? {
              freq: 'weekly',
              interval: 5,
              dtstart: event.dateTimeStarted,
              until: event.dateTimeEnded,
            }
          : undefined,
        display: event.isRecurring ? 'list-item' : 'block',
      }))
    },

    /* HANDLE DATE SELECTION RANGE */
    handleDateRange(info: any) {
      if (info.start < new Date().setHours(0, 0, 0, 0)) {
        ElMessage.warning('Cannot create event in the past')
        return
      }
      this.calendarEventStore.formController('Create Event')
      this.calendarEventStore.calendarEventForm.dateRange = {
        start: moment(info.startStr).format(),
        end: moment(info.endStr).subtract(1, 'days').format(),
      }
    },

    /* MOVE / RESIZE EVENT */
    async moveResizeEvent(info: any) {
      this.calendarEventStore.loading = true
      document.querySelectorAll('.bs-popover-auto').forEach((el) => el.remove())

      if (info.event.extendedProps.userId !== this.currentUserId) {
        ElMessage.warning('Only the event owner can make changes.')
        this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
        return
      }

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      if (info.event.start && new Date(info.event.startStr) < todayStart) {
        ElMessage.warning('Cannot move or resize past events.')
        this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
        return
      }

      try {
        await supabase
          .from('CalendarEvent')
          .delete()
          .eq('calendarEventId', info.event.extendedProps.calendarEventId)

        const startDate = moment(info.event.startStr).format('YYYY-MM-DD')
        const endDate = moment(info.event.endStr).subtract(1, 'days').format('YYYY-MM-DD')
        const startTime = moment(info.event.extendedProps.dateTimeStarted).format('HH:mm:ss')
        const endTime = moment(info.event.extendedProps.dateTimeEnded).format('HH:mm:ss')
        const startDateTime = `${startDate}T${startTime}`
        const endDateTime = `${endDate}T${endTime}`
        const calendarEventGroupId = uuidv4()

        const payload = {
          calendarId: info.event.extendedProps.calendarId,
          userId: this.currentUserId,
          calendarEventName: info.event.extendedProps.calendarEventName,
          calendarEventDescription: info.event.extendedProps.calendarEventDescription,
          calendarEventColor: info.event.extendedProps.calendarEventColor,
          dateTimeStarted: this.calendarApi?.view?.type === 'dayGridMonth' ? startDateTime : info.event.startStr,
          dateTimeEnded: this.calendarApi?.view?.type === 'dayGridMonth' ? endDateTime : info.event.endStr,
          isRecurring: info.event.extendedProps.isRecurring,
          calendarEventGroupId,
        }

        const { error } = await supabase.from('CalendarEvent').insert(payload)
        if (error) throw error

        await this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
      } catch (error) {
        console.error(error)
      } finally {
        this.calendarEventStore.loading = false
      }
    },

    /* CLICK EVENT ON CALENDAR */
    eventClick(info: any) {
      this.calendarEventStore.calendarEventForm.dateTimeStartedDetails = moment(info.event.extendedProps.dateTimeStarted).format('MM/DD/YYYY HH:mm')
      this.calendarEventStore.calendarEventForm.dateTimeEndedDetails = moment(info.event.extendedProps.dateTimeEnded).format('MM/DD/YYYY HH:mm')
      this.calendarEventStore.calendarEventForm.userId = info.event.extendedProps.userId
      this.calendarEventStore.calendarEventForm.calendarEventId = info.event.extendedProps.calendarEventId
      this.calendarEventStore.calendarEventForm.calendarEventName = info.event.extendedProps.calendarEventName
      this.calendarEventStore.calendarEventForm.calendarEventDescription = info.event.extendedProps.calendarEventDescription
      this.calendarEventStore.calendarEventForm.calendarEventColor = info.event.extendedProps.calendarEventColor
      this.calendarEventStore.calendarEventForm.startTime = info.event.extendedProps.dateTimeStarted
      this.calendarEventStore.calendarEventForm.endTime = info.event.extendedProps.dateTimeEnded
      this.calendarEventStore.calendarEventForm.dateRange = {
        start: moment(info.event.extendedProps.dateTimeStarted).format(),
        end: moment(info.event.extendedProps.dateTimeEnded).format(),
      }
      this.calendarEventStore.calendarEventForm.isRecurring = info.event.extendedProps.isRecurring
      this.calendarEventStore.calendarEventForm.calendarId = info.event.extendedProps.calendarId
      this.calendarEventStore.calendarEventForm.calendarEventGroupId = info.event.extendedProps.calendarEventGroupId

      if (info.event.extendedProps.isRecurring) {
        this.calendarEventStore.formController('Open Recurring Event')
      } else {
        this.calendarEventStore.formController('Event Details')
      }
    },

    /* CHECK ALL CALENDAR EVENTS */
    checkAllEvents() {
      this.calendarEventStore.calendarEvents.forEach((calendarEvent) => {
        if (calendarEvent.calendarEventId) {
          this.calendarEventStore.selectedCalendarEvent[calendarEvent.calendarEventId] = true
        }
      })
    },

    /* UNCHECK ALL CALENDAR EVENTS */
    uncheckAllEvents() {
      this.calendarEventStore.calendarEvents.forEach((calendarEvent) => {
        if (calendarEvent.calendarEventId) {
          this.calendarEventStore.selectedCalendarEvent[calendarEvent.calendarEventId] = false
        }
      })
    },

    /* CHECK SHOW/HIDE INDIVIDUAL CALENDAR EVENT */
    handleCheckboxChange(calendarEventId: string, calendarEventGroupId: string) {
      const isChecked = this.calendarEventStore.selectedCalendarEvent[calendarEventId]
      const events = this.calendarOptions.events

      if (!Array.isArray(events)) {
        return
      }

      this.calendarOptions.events = events.map((event: any) => {
        if (event.extendedProps.calendarEventGroupId === calendarEventGroupId) {
          const displayStatus = isChecked ? (event.rrule ? 'list-item' : 'block') : 'none'
          return {
            ...event,
            display: displayStatus,
            backgroundColor: event.extendedProps.calendarEventColor,
          }
        }
        return event
      })
    },

    /* SIDEBAR VCALENDAR CHECK MOVEMENT */
    didMove(info: any) {
      const formatDate = moment(info[0].id).add(1, 'days').format()
      this.calendarApi.gotoDate(formatDate)
      this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
    },

    /* SIDEBAR VCALENDAR DAY CLICK */
    dayClick(info: any) {
      this.calendarEventStore.weekClicked = false
      this.calendarEventStore.dayClicked = true
      this.calendarApi.changeView('timeGridDay')
      this.calendarApi.gotoDate(info.endDate)
      this.calendarEventStore.getCalendarEventsByCalendarId(this.calendarEventStore.selectedCalendarId)
    },
  },

  async mounted() {
    const refCalendar = this.$refs.refCalendar as any
    this.calendarApi = refCalendar.getApi()

    const { data } = await supabase.auth.getUser()
    this.currentUserId = data.user?.id || ''
  },

  watch: {
    'calendarEventStore.calendarEventForm.dateRange': {
      handler(newRange) {
        if (!newRange?.start || !newRange?.end) return
        this.calendarEventStore.disableRecurringDays(newRange.start, newRange.end)
      },
      deep: true,
      immediate: true,
    },
  },
})
</script>