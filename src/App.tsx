import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Rome from "./routes/Rome";
import Error from "./routes/Error";
import Login from "./routes/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rome />,
    errorElement: <Error />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}