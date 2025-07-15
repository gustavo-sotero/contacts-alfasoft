import AddContactView from '@/views/AddContactView.vue'
import ContactDetailsView from '@/views/ContactDetailsView.vue'
import EditContactView from '@/views/EditContactView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Contatos - Lista',
      },
    },
    {
      path: '/contacts/:id',
      name: 'contact-details',
      component: ContactDetailsView,
      meta: {
        title: 'Detalhes do Contato',
      },
    },
    {
      path: '/add',
      name: 'add-contact',
      component: AddContactView,
      meta: {
        title: 'Adicionar Contato',
      },
    },
    {
      path: '/edit/:id',
      name: 'edit-contact',
      component: EditContactView,
      meta: {
        title: 'Editar Contato',
      },
    },
    // Redirecionar rotas inválidas para home
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Atualizar título da página baseado na rota
router.beforeEach((to) => {
  document.title = (to.meta?.title as string) || 'Contatos'
})

export default router
