import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Rome from "./routes/Rome";
import Error from "./routes/Error";
import Login from "./routes/Login";
import { useEffect } from "react";
import { info } from "@tauri-apps/plugin-log";
import './App.css';

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

  useEffect(() => {

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  })

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };
  const handleMouseUp = () => {
    document.body.classList.remove('no-select'); 
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 2) {
      info('right click')
      document.body.classList.add('no-select'); 
    }
  };

  return <RouterProvider router={router} />;
}


const preventWheelHandle = (event: WheelEvent) => {
  event.preventDefault(); // 阻止滚动
};


export function preventWheel() {
  window.addEventListener('wheel', preventWheelHandle, { passive: false });
}


export function recoverWheel() {
  window.removeEventListener('wheel', preventWheelHandle);
}