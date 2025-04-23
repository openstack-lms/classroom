"use client";

import { LoginRequest, LoginResponse } from "@/interfaces/api/Auth";
import { ApiResponse } from "@/interfaces/api/Response";
import { addAlert } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  })

  const dispatch = useDispatch();
  
  const appState = useSelector((state: RootState) => state.app);

  useEffect(() => {
    if (appState.user.loggedIn) {
      redirect('/classes/');
    }
  }, [appState.user.loggedIn])

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center">
      <form className="bg-background border flex flex-col space-y-5 border-border rounded-md w-[30rem] p-8"
      onSubmit={(e) => {
        e.preventDefault();
        
        fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        .then((res) => res.json())
        .then((data: ApiResponse<LoginResponse>) => {
          if ((data.payload as LoginResponse).authenticated) {
            dispatch(addAlert({ remark: 'Successfully logged in', level: 1 }));
            window.location.href ='/';
          } else {
            dispatch(addAlert({ remark: 'Invalid credentials', level: 2 }));
          }
        });
      }}>
        <h1 className="font-semibold text-2xl text-foreground">Sign in to your account</h1>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Username</span>
          <input 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            type="text" placeholder="Username" className="w-full bg-background-subtle rounded-md p-3 mt-2 outline-none" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Password</span>
          <input
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            type="text" placeholder="Password" className="w-full bg-background-subtle rounded-md p-3 mt-2 outline-none" />
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-foreground">Remember me</span>
          <input type="checkbox" className="mt-1 size-4 ring-primary-500 focus:ring-primary-500 bg-primary-500" />
        </div>
        <button className="bg-primary-500 hover:bg-primary-600 text-white rounded-md p-3">Sign in</button>
      </form>
    </div>
  );
}
