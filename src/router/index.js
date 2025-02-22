import { createRouter, createWebHistory } from 'vue-router';

import PatientsList from '@/views/PatientsList.vue';
import DetailsPatient from '@/views/DetailsPatient.vue';
import CalendarView from '@/views/CalendarView.vue';
import Login from '@/views/Login.vue';
import Logout from '@/views/Logout.vue';
import FormIncomingCalls from '@/views/FormIncomingCalls.vue';
import FormOutgoingCalls from '@/views/FormOutgoingCalls.vue';
import FormPatient from '@/views/FormPatient.vue';
import CallsView from '../views/CallsView.vue';
import generateWarn from '../views/GenerateWarn.vue';
import WarnDetails from '@/views/WarnDetails.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PatientsList,
    },
    {
      path: '/myCalls/:operador?',
      name: 'myCallsOperador',
      component: CalendarView,
      props: route => ({ tipo: route.params.tipo, operador: parseInt(route.params.operador) })
    },
    {
      path: '/myCalls/:paciente?',
      name: 'calendarView',
      component: CalendarView,
      props: route => ({ tipo: route.params.tipo, paciente: route.params.paciente })
    },
    {
      path: '/calendarView',
      name: 'calendarView',
      component: CalendarView,
    },
    {
      path: '/calendarViewAvisos',
      name: 'calendarViewAvisos',
      component: CalendarView,
    },
    {
      path: '/callsView/:id',
      name: 'callsView',
      component: CallsView,
      props: true,
    },
    {
      path: '/detailsPatient/:id',
      name: 'detailsPatient',
      component: DetailsPatient,
      props: true,
    },
    {
      path: '/registerIncomingCall',
      name: 'registerIncomingCall',
      component: FormIncomingCalls,
      props: route => ({
        emergencia: route.query.emergencia,
        paciente_id: route.query.paciente_id,
      }),
    },
    {
      path: '/editIncomingCall/:id',
      name: 'editIncomingCall',
      component: FormIncomingCalls,
      props: route => ({
        id: route.params.id,
        paciente_id: route.query.paciente_id,
      }),
    },
    
    {
      path: '/registerOutgoingCall',
      name: 'registerOutgoingCall',
      component: FormOutgoingCalls,
    },
    {
      path: '/editOutgoingCall/:id',
      name: 'editOutgoingCall',
      component: FormOutgoingCalls,
      props: true,
    },
    {
      path: '/generateWarn',
      name: 'generateWarn',
      component: generateWarn,
      props: (route) => ({ tipo: route.query.tipo }),
    },
    {
      path: '/warnDetails/:id',
      name: 'warnDetails',
      component: WarnDetails,
      props: true,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout,
    },
    {
      path: '/registerPatient',
      name: 'registerPatient',
      component: FormPatient,
    },
    {
      path: '/editPatient/:id',
      name: 'editPatient',
      component: FormPatient,
      props: true,
    },
  ],
});

export default router;
