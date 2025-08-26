import Layout from '@/layouts';
import Admin from '@/pages/admin';
import Error404 from '@/pages/error404';
import Home from '@/pages/home';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      errorElement: <Error404 />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/admin',
          element: <Admin />,
        },
      ],
    },
  ],
  // {
  //   basename: '/farm', // 👈 important
  // }
);

export default router;
