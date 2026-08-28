import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabaseClient'
import { ElMessage, ElMessageBox } from 'element-plus'
import moment from 'moment'
import debounce from 'lodash/debounce';

import { markRaw } from 'vue'
import { Delete } from '@element-plus/icons-vue'

export interface Calendar {
    calendarId: number | string,
    userId: string,
    calendarName: string,
    dateTimeCreated: string,
    isDeleted: string,
}

export interface CalendarPagination {
    currentPage: number,
    elementsPerPage: number,
    totalElements: number,
}

export const useCalendarStore = defineStore('calendar', {
    state: () => ({
        title: '' as String,
        loading: false as Boolean,
        search: '' as String,
        selectedCalendarId: '' as string,

        calendars: [] as Calendar[],
        calendarForm: {} as Calendar,

        calendarPagination: {
            currentPage: 1,
            elementsPerPage: 10,
            totalElements: 0,
        } as CalendarPagination,

        dialog: {
            calendar: false as Boolean,
            sharedCalendar: false as Boolean,
        }

    }),
    actions: {
        searchCalendar: debounce(function(this: any) {
            this.fetchCalendars()
            this.calendarPagination.currentPage = 1
        }, 300),
        
        /* GET WITH SEARCH */
        async fetchCalendars(): Promise<void> {
            try {
                this.loading = true

                const limit = this.calendarPagination.elementsPerPage;
                const from = (this.calendarPagination.currentPage - 1) * limit;
                const to = from + limit - 1;

                let query = supabase
                    .from('Calendar')
                    .select('*', { count: 'exact' })

                if (this.search && this.search.trim() !== '') {
                    query = query.ilike('name', `%${this.search}%`);
                }

                query = query.order('dateTimeCreated', { ascending: false }).range(from, to);

                const { data, error, count } = await query;

                if(error) throw error

                this.calendars = data.map((data: Calendar) => ({
                    ...data,
                    dateTimeCreated: moment(data.dateTimeCreated).format('LLL')
                })) || []
                
                this.calendarPagination.currentPage = this.calendarPagination.currentPage;
                this.calendarPagination.totalElements = count || 0;
            }
            catch(error) {
                console.log(error)
            }
            finally {
                this.loading = false
            }
        },

        /* DELETE */
        async deleteCalendar(id: number): Promise<void> {
            try {
                await ElMessageBox.confirm('Do you want to delete this calendar?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                    icon: markRaw(Delete),
                })

                this.loading = true

                const { error } = await supabase
                    .from('Calendar')
                    .delete()
                    .eq('id', id)

                if (error) throw error

                ElMessage.success('Calendar deleted successfully.')
                await this.fetchCalendars()

            } catch (error) {
                console.error(error)
            } finally {
                this.loading = false
            }
        },

        /* CREATE / UPDATE */
        async submitForm(): Promise<void> {
            try{
                const payload = {
                    userId: this.calendarForm.userId,
                    calendarName: this.calendarForm.calendarName,
                }

                if(this.title === 'Create Calendar') {
                    const { error } = await supabase
                    .from('Calendar')
                    .insert(payload) 

                    if(error) throw error

                    await this.fetchCalendars()
                    this.clear()

                    ElMessage.success('Calendar created successfully.')
                }

                if(this.title === 'Edit Calendar') {
                    const { error } = await supabase
                    .from('Calendar')
                    .update(payload)
                    .eq('id', this.calendarForm.calendarId)

                    if(error) throw error

                    await this.fetchCalendars()
                    this.clear()

                    ElMessage.success('Calendar updated successfully.')
                }

            } catch (error) {
                console.error(error)
            } finally {
                this.loading = false
                this.dialog.calendar = false
            }
        },

        /* DIALOG CONTROLLER */
        formController(action: string, data: any) {
            this.title = action
            this.dialog.calendar = true

            if(action == "Created Calendar") {}

            if(action == "Edit Calendar") {
                this.calendarForm = { ...data }
            }

            if(action === 'Share Calendar'){
                this.dialog.sharedCalendar = true
                this.selectedCalendarId = data.calendarId
            }
        },

        /* CLEAR */
        clear() {
            Object.assign(this.calendarForm, {
                id: undefined,
                name: '',
                description: '',
                price: null,
            })
            this.dialog.calendar = false
        }
    }
})