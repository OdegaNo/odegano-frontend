import { createBrowserRouter, RouterProvider } from 'react-router'
import Root from '@/pages/Root'
import NotFound from '@/pages/NotFound'
import QuestionPage from '@/pages/question/QuestionPage'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root
  },
  {
    path: "/question",
    Component:QuestionPage
  },
  {
    path: '*',
    Component: NotFound
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}