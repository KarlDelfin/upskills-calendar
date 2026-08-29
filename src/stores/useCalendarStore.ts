import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabaseClient'
import { ElMessage, ElMessageBox } from 'element-plus'
import moment from 'moment'
import debounce from 'lodash/debounce';

import { markRaw } from 'vue'
import { Delete } from '@element-plus/icons-vue'

import { useAuthStore } from './useAuthStore';

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
        tab: 'first' as string,
        title: '' as String,
        loading: {
            calendar: false,
            sharedCalendar: false
        },
        search: {
            calendar: '' as string,
            user: '' as string
        },
        selectedCalendarId: '' as string,

        users: [] as any[],
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
    getters: {
        userId() {
            const authStore = useAuthStore()
            return authStore.user?.id || null
        }
    },
    actions: {
        searchCalendar: debounce(function(this: any) {
            this.fetchCalendars()
            this.calendarPagination.currentPage = 1
        }, 500),
        
        /* GET WITH SEARCH */
        async fetchCalendars(): Promise<void> {
            try {
                this.loading.calendar = true

                const limit = this.calendarPagination.elementsPerPage;
                const from = (this.calendarPagination.currentPage - 1) * limit;
                const to = from + limit - 1;

                let query = supabase
                    .from('Calendar')
                    .select('*', { count: 'exact' })

                if (this.search.calendar && this.search.calendar.trim() !== '') {
                    query = query.ilike('name', `%${this.search.calendar}%`);
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
                this.loading.calendar = false
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

                this.loading.calendar = true

                const { error } = await supabase
                    .from('Calendar')
                    .delete()
                    .eq('calendarId', id)

                if (error) throw error

                ElMessage.success('Calendar deleted successfully.')
                await this.fetchCalendars()

            } catch (error) {
                console.error(error)
            } finally {
                this.loading.calendar = false
            }
        },

        /* CREATE CALENDAR */
        async createCalendar() {
            const payload = {
                userId: this.userId,
                calendarName: this.calendarForm.calendarName,
            }
            try {
                const { error } = await supabase
                .from('Calendar')
                .insert(payload) 

                if(error) throw error

                await this.fetchCalendars()
                this.clear()

                ElMessage.success('Calendar created successfully.')
            }
            catch(error) {
                console.error(error)
                ElMessage.error("Failed to create calendar.")
            }
            finally {
                this.loading.calendar = false
            }
        },

        /* EDIT CALENDAR */
        async editCalendar() {
            try {
                const payload = {
                    userId: this.userId,
                    calendarName: this.calendarForm.calendarName,
                }

                const { error } = await supabase
                .from('Calendar')
                .update(payload)
                .eq('calendarId', this.calendarForm.calendarId)

                if(error) throw error

                await this.fetchCalendars()
                this.clear()

                ElMessage.success('Calendar updated successfully.')
            } catch(error) {
                console.error(error)
                ElMessage.error("Failed to update calendar.")
            } finally {
                this.loading.calendar = false
            }
        },

        /* DIALOG CONTROLLER */
        async formController(action: string, data: any) {
            this.title = action

            if(action == "Create Calendar") {
                this.dialog.calendar = true
            }

            if(action == "Edit Calendar") {
                this.dialog.calendar = true
                this.calendarForm = { ...data }
            }

            if(action === 'Shared Calendar'){
                this.dialog.sharedCalendar = true
                this.selectedCalendarId = data.calendarId
            }
        },

        searchUserByEmail: debounce(function(this: any) {
            this.getUserByEmail()
        }, 500),

        /* GET USER BY EMAIL */
        async getUserByEmail() {
            this.loading.sharedCalendar = true;
            try {
                const { data, error } = await supabase.rpc('search_users_by_email', {
                    search_term: this.search.user
                });
                if (error) throw error;
                this.users = data || []
            } catch (error) {
                ElMessage.error('An unexpected error occurred');
                console.error(error);
            } finally {
                this.loading.sharedCalendar = false;
            }
        },

        /* GET ASSGINED USERS */
        async getAssignedUsers() {
            this.loading.sharedCalendar = true

            try {
                const { data: sharedUsers, error } = await supabase
                    .from('SharedCalendar')
                    .select('*')
                    .eq('calendarId', this.selectedCalendarId)
                    .eq('calendarOwnerUserId', this.userId)

                if (error) throw error

                const { data: { users } } = await supabase.auth.admin.listUsers()
                    const sharedUserIds = sharedUsers.map( item => item.shareToUserId )
                    this.users = users.filter(user => sharedUserIds.includes(user.id) )

            } catch (error) {
                console.error(error)
            } finally {
                this.loading.sharedCalendar = false
            }
        },

        /* CHANGE SHARED CALENDAR FORM TAB */
        changeTab(data: any){
            this.users = []
            if(data.paneName === 'first'){ }
            if(data.paneName === 'second'){
                this.getAssignedUsers()
            }
        },

        /* ASSIGN USER TO A CALENDAR */
        async assignUser(userId: string) {

            this.loading.sharedCalendar = true;
            let payload = {
                calendarId: this.selectedCalendarId,
                shareToUserId: userId,
                calendarOwnerUserId: this.userId
            }
            /* CHECK IF USER ALREADY HAS ACCESS TO THIS CALENDAR */
            try{
                const { data, error} = await supabase
                    .from('SharedCalendar')
                    .select('*')
                    .eq('shareToUserId', userId)
                    .eq('calendarId', this.selectedCalendarId)
                if(error) throw error
                if(data.length > 0) {
                    ElMessage.warning('The user already has access to this calendar')
                    return
                }
            }
            catch(error){
                ElMessage.error('An unexpected error occurred')
                console.error(error)
            }
            finally{
                this.loading.sharedCalendar = false;
            }
            
            /* ASSIGN USER */
            try{
                const { data, error } = await supabase
                    .from('SharedCalendar')
                    .insert(payload)
                if(error) throw error
                ElMessage.success("User assigned successfully.")
                await this.getUserByEmail()
            }
            catch(error){
                ElMessage.error('Failed to assign user.')
                console.error(error)
            }
            finally{
                this.loading.sharedCalendar = false;
            }
        },

        /* UNASSIGN USER TO A CALENDAR */
        async unassignUser(userId: string) {
            await ElMessageBox.confirm('Do you want to remove this user?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
                icon: markRaw(Delete),
            })

            this.loading.sharedCalendar = true;

            try {
                let { error } = await supabase
                    .from('SharedCalendar')
                    .delete()
                    .eq('shareToUserId', userId)
                    .eq('calendarId', this.selectedCalendarId);

                if (error) throw error
                ElMessage.success("User unassigned successfully")
                this.getAssignedUsers();
            } catch (error) {
                console.error(error);
                ElMessage.error('Failed to unassign user.')
            } finally {
                this.loading.sharedCalendar = false;
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
            Object.assign(this.dialog, {
                calendar: false,
                sharedCalendar: false
            })
            this.tab = 'first'
        }
    }
})