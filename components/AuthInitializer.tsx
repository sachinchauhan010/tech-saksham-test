"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setUser,
  clearUser,
  setLoading,
} from "@/redux/slices/authSlice";
import { getCurrentUser } from "@/services/authService";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true));
      try {
        const user = await getCurrentUser();
        dispatch(setUser(user));
      } catch {
        dispatch(clearUser());
      }
    };

    checkAuth();
  }, []);

  return null;
}
