"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useApi from "@/utils/useApi";

interface UserContextType {
  user: any;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: any) => void; // <-- add this
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  setUser: () => {}, 
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const { data, loading, fetchApi: fetchUser } = useApi({
    url: "/api/currentuser",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      getCookie("token");

    if (token) {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, user]);

  const refreshUser = async () => {
    await fetchUser();
  };

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
