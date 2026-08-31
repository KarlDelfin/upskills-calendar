import { defineStore } from 'pinia'
import { supabase } from '../utils/supabaseClient'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

export interface Calendar {
  calendarId: string
  userId: string
  createdByUser?: string
  calendarName: string
  dateTimeCreated?: string
  isDeleted?: boolean
}

export interface SharedCalendar {
  sharedCalendarId: string
  ownerUserId: string
  ownerFullName: string
  shareToUserId: string
  calendarId: string
  calendarName: string
}

export interface DateRange {
  start: string | Date | null
  end: string | Date | null
}

export interface CalendarEvent {
  calendarEventId?: string
  calendarId: string
  userId?: string
  calendarEventName: string
  calendarEventDescription: string
  calendarEventColor: string
  isRecurring: boolean
  calendarEventGroupId?: string
  dateTimeStarted?: string
  dateTimeEnded?: string
}

export interface CalendarEventForm extends CalendarEvent {
  dateTimeStartedDetails?: string
  dateTimeEndedDetails?: string
  startTime: Date | string
  endTime: Date | string
  dateRange: DateRange
  selectedRecurringDays: number[]
}

export interface RecurringDay {
  label: string
  value: number
  checked: boolean
  disabled: boolean
}

export const useCalendarEventStore = defineStore('calendarEvent', {
  state: () => ({
    pickerKey: 0,
    popover: { visibility: 'click' as const },

    selectedCalendarId: '' as string,
    selectedCalendarName: '' as string,

    firstDayOfMonth: new Date().toISOString(),
    lastDayOfMonth: new Date().toISOString(),
    currentYear: moment().format('YYYY'),
    currentMonth: moment().format('MM'),
    currentStartDateTime: new Date().toISOString(),
    currentEndDateTime: new Date().toISOString(),

    weekClicked: false,
    dayClicked: false,

    sidebar: {
      calendarId: '' as string,
      sharedCalendarId: '' as string,
    },

    dialog: {
      recurringEventOperation: false,
      calendarForm: false,
      calendarEventForm: false,
      calendarEventConfirmation: false,
      title: '',
    },

    loading: false,

    calendars: [] as (Calendar | SharedCalendar)[],
    selectedCalendarEvent: {} as Record<string, boolean>,
    calendarEvents: [] as CalendarEvent[],
    rawCalendarEvents: [] as CalendarEvent[],

    operationForm: {
      isSeries: false,
    },

    calendarForm: {
      calendarName: '',
    },

    calendarEventForm: {
      dateTimeStartedDetails: '',
      dateTimeEndedDetails: '',
      calendarEventId: '',
      calendarId: '',
      userId: '',
      calendarEventName: '',
      calendarEventDescription: '',
      calendarEventColor: '#409EFF',
      startTime: new Date(2026, 6, 24, 9, 0),
      endTime: new Date(2026, 6, 24, 18, 0),
      isRecurring: false,
      calendarEventGroupId: '',
      dateRange: {
        start: null,
        end: null,
      },
      selectedRecurringDays: [] as number[],
    } as CalendarEventForm,

    recurringDays: [
      { label: 'Sun', value: 0, checked: false, disabled: false },
      { label: 'Mon', value: 1, checked: false, disabled: false },
      { label: 'Tue', value: 2, checked: false, disabled: false },
      { label: 'Wed', value: 3, checked: false, disabled: false },
      { label: 'Thu', value: 4, checked: false, disabled: false },
      { label: 'Fri', value: 5, checked: false, disabled: false },
      { label: 'Sat', value: 6, checked: false, disabled: false },
    ] as RecurringDay[],

    predefineColors: [
      '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585'
    ],

    today: new Date(),
  }),

  getters: {
    attributes(state) {
      return [
        {
          highlight: {
            start: { fillMode: 'outline' },
            base: { fillMode: 'light' },
            end: { fillMode: 'outline' },
          },
          dates: {
            start: new Date(state.currentStartDateTime),
            end: new Date(state.currentEndDateTime),
          },
        },
      ]
    },
  },

  actions: {
    /* Get current logged in user ID safely */
    async getCurrentUserId(): Promise<string | null> {
      const { data } = await supabase.auth.getUser()
      return data.user?.id || null
    },

    /* FORM CONTROLLER */
    async formController(title: string) {
      this.dialog.title = title
      if (title === 'Create Calendar') {
        this.dialog.calendarForm = true
      }

      if (title === 'Create Event') {
        if (!this.selectedCalendarId) {
          ElMessage.warning('Please select a calendar first')
          return
        }
        this.dialog.calendarEventForm = true
      }

      if (title === 'Edit Non-Recurring Event' || title === 'Edit Recurring Event') {
        this.dialog.calendarEventForm = true
        this.dialog.recurringEventOperation = false
      }

      if (title === 'Open Recurring Event') {
        this.dialog.recurringEventOperation = false
        this.dialog.calendarEventConfirmation = true
      }

      if (title === 'Event Details') {
        this.dialog.recurringEventOperation = true

        /* RECURRING (ON SERIES) */
        if (this.operationForm.isSeries && this.calendarEventForm.isRecurring) {
          const { data } = await supabase
            .from('CalendarEvent')
            .select('*')
            .eq('calendarEventGroupId', this.calendarEventForm.calendarEventGroupId)
            .order('dateTimeStarted', { ascending: true })

          if (data && data.length > 0) {
            this.calendarEventForm.dateTimeStartedDetails = moment(data[0].dateTimeStarted).format('MM/DD/YYYY HH:mm')
            this.calendarEventForm.dateTimeEndedDetails = moment(data[data.length - 1].dateTimeEnded).format('MM/DD/YYYY HH:mm')
            this.calendarEventForm.userId = data[0].userId
            this.calendarEventForm.calendarEventId = data[0].calendarEventId
            this.calendarEventForm.calendarEventName = data[0].calendarEventName
            this.calendarEventForm.calendarEventDescription = data[0].calendarEventDescription
            this.calendarEventForm.calendarEventColor = data[0].calendarEventColor
            this.calendarEventForm.startTime = data[0].dateTimeStarted
            this.calendarEventForm.endTime = data[0].dateTimeEnded
            this.calendarEventForm.dateRange = {
              start: moment(data[0].dateTimeStarted).format('MM/DD/YYYY HH:mm'),
              end: moment(data[data.length - 1].dateTimeEnded).format('MM/DD/YYYY HH:mm'),
            }
            this.calendarEventForm.isRecurring = data[0].isRecurring
            this.calendarEventForm.calendarId = data[0].calendarId
          }
        }

        /* RECURRING (JUST ONE) */
        if (!this.operationForm.isSeries && this.calendarEventForm.isRecurring) {
          const { data } = await supabase
            .from('CalendarEvent')
            .select('*')
            .eq('calendarEventId', this.calendarEventForm.calendarEventId)
            .order('dateTimeStarted', { ascending: false })

          if (data && data.length > 0) {
            this.calendarEventForm.dateTimeStartedDetails = moment(data[0].dateTimeStarted).format('MM/DD/YYYY HH:mm')
            this.calendarEventForm.dateTimeEndedDetails = moment(data[data.length - 1].dateTimeEnded).format('MM/DD/YYYY HH:mm')
            this.calendarEventForm.userId = data[0].userId
            this.calendarEventForm.calendarEventId = data[0].calendarEventId
            this.calendarEventForm.calendarEventName = data[0].calendarEventName
            this.calendarEventForm.calendarEventDescription = data[0].calendarEventDescription
            this.calendarEventForm.calendarEventColor = data[0].calendarEventColor
            this.calendarEventForm.startTime = data[0].dateTimeStarted
            this.calendarEventForm.endTime = data[0].dateTimeEnded
            this.calendarEventForm.dateRange = {
              start: moment(data[0].dateTimeStarted).format('MM/DD/YYYY HH:mm'),
              end: moment(data[data.length - 1].dateTimeEnded).format('MM/DD/YYYY HH:mm'),
            }
            this.calendarEventForm.isRecurring = data[0].isRecurring
            this.calendarEventForm.calendarId = data[0].calendarId
          }
        }
      }
    },

    /* CREATE / UPDATE FORM SUBMISSION */
    async submitForm() {
      this.loading = true
      const currentUserId = await this.getCurrentUserId()

      /* CREATE CALENDAR */
      if (this.dialog.title === 'Create Calendar') {
        try {
          const { error } = await supabase.from('Calendar').insert({
            userId: currentUserId,
            calendarName: this.calendarForm.calendarName,
          })

          if (error) {
            ElMessage.error('Failed to add Calendar')
            return
          }

          ElMessage.success('Calendar added successfully')
          this.clear()
          await this.getCalendarsByUserId()
        } catch (error) {
          ElMessage.error('An unexpected error occurred')
          console.error(error)
        } finally {
          this.loading = false
        }
      }

      /* CREATE / EDIT CALENDAR EVENT */
      if (
        this.dialog.title === 'Create Event' ||
        this.dialog.title === 'Edit Non-Recurring Event' ||
        this.dialog.title === 'Edit Recurring Event'
      ) {
        const calendarEventsPayload = []
        const calendarEventGroupId = uuidv4()

        if (!this.calendarEventForm.dateRange.start || !this.calendarEventForm.dateRange.end) {
          ElMessage.warning('Please select a valid date range')
          this.loading = false
          return
        }

        let startDate = new Date(moment(this.calendarEventForm.dateRange.start).format())
        let endDate = new Date(moment(this.calendarEventForm.dateRange.end).format())

        if (this.dialog.title === 'Edit Non-Recurring Event') {
          await supabase
            .from('CalendarEvent')
            .delete()
            .eq('calendarEventId', this.calendarEventForm.calendarEventId)
        }

        if (this.dialog.title === 'Edit Recurring Event' && !this.operationForm.isSeries) {
          await supabase
            .from('CalendarEvent')
            .delete()
            .eq('calendarEventId', this.calendarEventForm.calendarEventId)
        }

        if (this.dialog.title === 'Edit Recurring Event' && this.operationForm.isSeries) {
          await supabase
            .from('CalendarEvent')
            .delete()
            .eq('calendarEventGroupId', this.calendarEventForm.calendarEventGroupId)
        }

        /* RECURRING EVENTS */
        if (this.calendarEventForm.isRecurring) {
          while (startDate <= endDate) {
            const startDay = startDate.getDay()

            if (this.calendarEventForm.selectedRecurringDays.length > 0) {
              if (this.calendarEventForm.selectedRecurringDays.includes(startDay)) {
                calendarEventsPayload.push({
                  calendarId: this.selectedCalendarId,
                  calendarEventName: this.calendarEventForm.calendarEventName,
                  userId: currentUserId,
                  calendarEventDescription: this.calendarEventForm.calendarEventDescription,
                  calendarEventColor: this.calendarEventForm.calendarEventColor,
                  isRecurring: this.calendarEventForm.isRecurring,
                  dateTimeStarted: moment(startDate).format(`YYYY-MM-DDT${moment(this.calendarEventForm.startTime).format('HH:mm:ss')}`),
                  dateTimeEnded: moment(startDate).format(`YYYY-MM-DDT${moment(this.calendarEventForm.endTime).format('HH:mm:ss')}`),
                  calendarEventGroupId: calendarEventGroupId,
                })
              }
            } else {
              calendarEventsPayload.push({
                calendarId: this.selectedCalendarId,
                calendarEventName: this.calendarEventForm.calendarEventName,
                userId: currentUserId,
                calendarEventDescription: this.calendarEventForm.calendarEventDescription,
                calendarEventColor: this.calendarEventForm.calendarEventColor,
                isRecurring: this.calendarEventForm.isRecurring,
                dateTimeStarted: moment(startDate).format(`YYYY-MM-DDT${moment(this.calendarEventForm.startTime).format('HH:mm:ss')}`),
                dateTimeEnded: moment(startDate).format(`YYYY-MM-DDT${moment(this.calendarEventForm.endTime).format('HH:mm:ss')}`),
                calendarEventGroupId: calendarEventGroupId,
              })
            }
            startDate.setDate(startDate.getDate() + 1)
          }
        } else {
          /* NON-RECURRING EVENT */
          calendarEventsPayload.push({
            calendarId: this.selectedCalendarId,
            calendarEventName: this.calendarEventForm.calendarEventName,
            userId: currentUserId,
            calendarEventDescription: this.calendarEventForm.calendarEventDescription,
            calendarEventColor: this.calendarEventForm.calendarEventColor,
            isRecurring: this.calendarEventForm.isRecurring,
            dateTimeStarted: moment(startDate).format(`YYYY-MM-DDT${moment(this.calendarEventForm.startTime).format('HH:mm:ss')}`),
            dateTimeEnded: moment(endDate).format(`YYYY-MM-DDT${moment(this.calendarEventForm.endTime).format('HH:mm:ss')}`),
            calendarEventGroupId: calendarEventGroupId,
          })
        }

        try {
          const { error } = await supabase.from('CalendarEvent').insert(calendarEventsPayload)

          if (error) {
            ElMessage.error('Failed to add Calendar Event')
            return
          }

          ElMessage.success('Calendar Event added successfully')
          this.clear()
          await this.getCalendarEventsByCalendarId(this.selectedCalendarId)
        } catch (error) {
          ElMessage.error('An unexpected error occurred')
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    /* GET CALENDARS BY USER ID */
    async getCalendarsByUserId() {
      this.sidebar.sharedCalendarId = ''
      this.loading = true
      try {
        const userId = await this.getCurrentUserId()
        const { data, error } = await supabase
          .from('Calendar')
          .select('*')
          .eq('userId', userId)
          .order('dateTimeCreated', { ascending: false })

        if (error) throw error

        const { data: { users } } = await supabase.auth.admin.listUsers()

        const userMap: Record<string, string> = {}
        users.forEach((user) => {
          userMap[user.id] = user.user_metadata?.full_name || user.email || user.id
        })

        this.calendars = (data || []).map((item) => ({
          calendarId: item.calendarId,
          userId: item.userId,
          createdByUser: userMap[item.userId] || item.userId,
          calendarName: item.calendarName,
          dateTimeCreated: item.dateTimeCreated,
          isDeleted: item.isDeleted,
        }))
      } catch (error) {
        ElMessage.error('An unexpected error occurred')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    /* GET SHARED CALENDARS */
    async getSharedCalendarsByUserId() {
      this.sidebar.calendarId = ''
      this.loading = true
      try {
        const userId = await this.getCurrentUserId()
        const { data, error } = await supabase
          .from('SharedCalendar')
          .select(`
            sharedCalendarId,
            shareToUserId,
            calendarId,
            calendar:Calendar (
                userId,
                calendarName
            )
          `)
          .eq('shareToUserId', userId)
          .order('dateTimeCreated', { ascending: false })

        if (error) throw error

        const { data: { users } } = await supabase.auth.admin.listUsers()

        const userMap: Record<string, string> = {}
        users.forEach((user) => {
          userMap[user.id] = user.user_metadata?.full_name || user.email || user.id
        })

        this.calendars = (data || []).map((item: any) => ({
          sharedCalendarId: item.sharedCalendarId,
          ownerUserId: item.calendar?.userId,
          ownerFullName: userMap[item.calendar?.userId] || item.calendar?.userId,
          shareToUserId: item.shareToUserId,
          calendarId: item.calendarId,
          calendarName: item.calendar?.calendarName,
        }))
      } catch (error) {
        ElMessage.error('An unexpected error occurred')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    /* GET CALENDAR EVENTS BY CALENDAR ID */
    async getCalendarEventsByCalendarId(calendarId: string) {
      this.selectedCalendarId = calendarId

      if (!this.selectedCalendarId) {
        ElMessage.warning('Please select a calendar first')
        return
      }

      const loadingInstance = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      try {
        const { data, error } = await supabase
          .from('CalendarEvent')
          .select('*')
          .eq('calendarId', this.selectedCalendarId)
          .gte('dateTimeStarted', this.firstDayOfMonth)
          .lte('dateTimeEnded', this.lastDayOfMonth)

        if (error) throw error

        this.rawCalendarEvents = data || []

        // Filter events for sidebar checkboxes
        this.calendarEvents = (data || []).filter(
          (value, index, self) =>
            index === self.findIndex((event) => event.calendarEventGroupId === value.calendarEventGroupId)
        )
      } catch (error) {
        ElMessage.error('An unexpected error occurred')
        console.error(error)
      } finally {
        loadingInstance.close()
      }
    },

    /* DELETE CALENDAR EVENT */
    async deleteCalendarEvent() {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      try {
        await ElMessageBox.confirm('Do you want to delete this Event?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        })

        try {
          if (this.calendarEventForm.isRecurring) {
            if (this.operationForm.isSeries) {
              await supabase
                .from('CalendarEvent')
                .delete()
                .eq('calendarEventGroupId', this.calendarEventForm.calendarEventGroupId)
            } else {
              await supabase
                .from('CalendarEvent')
                .delete()
                .eq('calendarEventId', this.calendarEventForm.calendarEventId)
            }
          } else {
            await supabase
              .from('CalendarEvent')
              .delete()
              .eq('calendarEventId', this.calendarEventForm.calendarEventId)
          }

          ElMessage.success('Event deleted successfully')
          this.clear()
          await this.getCalendarEventsByCalendarId(this.selectedCalendarId)
        } catch (error) {
          ElMessage.error('An unexpected error occurred')
          console.error(error)
        } finally {
          loadingInstance.close()
        }
      } catch {
        loadingInstance.close()
      }
    },

    /* CLEAR DIALOGS AND FORMS */
    clear() {
      this.dialog.calendarForm = false
      this.dialog.calendarEventForm = false
      this.dialog.calendarEventConfirmation = false
      this.dialog.recurringEventOperation = false

      this.loading = false

      this.calendarForm.calendarName = ''

      this.calendarEventForm.calendarEventId = ''
      this.calendarEventForm.calendarId = ''
      this.calendarEventForm.calendarEventName = ''
      this.calendarEventForm.calendarEventDescription = ''
      this.calendarEventForm.calendarEventColor = '#409EFF'
      this.calendarEventForm.isRecurring = false
      this.calendarEventForm.dateRange = {
        start: null,
        end: null,
      }
      this.calendarEventForm.selectedRecurringDays = []

      this.operationForm.isSeries = false
    },

    /* RECURRING DAY SELECTION TOGGLE */
    selectedRecurringDay(val: number) {
      const index = this.calendarEventForm.selectedRecurringDays.indexOf(val)
      if (index !== -1) {
        this.calendarEventForm.selectedRecurringDays.splice(index, 1)
      } else {
        this.calendarEventForm.selectedRecurringDays.push(val)
      }
    },

    /* DISABLE RECURRING DAYS OUT OF BOUNDS */
    disableRecurringDays(startDate: string | Date, endDate: string | Date) {
      const start = moment(startDate)
      const end = moment(endDate)

      const daysInRange = new Set<number>()
      let currentDate = start.clone()

      while (currentDate <= end) {
        daysInRange.add(currentDate.day())
        currentDate.add(1, 'day')
      }

      this.recurringDays = this.recurringDays.map((day) => ({
        ...day,
        disabled: !daysInRange.has(day.value),
      }))

      this.calendarEventForm.selectedRecurringDays =
        this.calendarEventForm.selectedRecurringDays.filter((d) => daysInRange.has(d))
    },
  },
})