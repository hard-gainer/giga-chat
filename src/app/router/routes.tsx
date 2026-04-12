import { createBrowserRouter } from 'react-router-dom';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('./routes/HomeRoute'),
  },
  {
    path: '/chat/:id',
    lazy: () => import('./routes/ChatRoute'),
  },
]);
