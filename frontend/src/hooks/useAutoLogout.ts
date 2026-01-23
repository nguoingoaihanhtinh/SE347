// src/hooks/useAutoLogout.ts
import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Hook to automatically logout user after 15 minutes of inactivity
 * Tracks user activity (mouse, keyboard, touch, scroll) and resets timer
 * Does NOT logout on page refresh (F5) - only on idle timeout
 */
export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timer if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timeout for auto-logout
    timeoutRef.current = setTimeout(() => {
      console.log("Auto-logout: User inactive for 15 minutes");
      logout();
      navigate("/login", { 
        state: { 
          message: "Phiên đăng nhập đã hết hạn do không hoạt động trong 15 phút. Vui lòng đăng nhập lại." 
        } 
      });
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    // Only setup auto-logout if user is authenticated
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Initialize timer on mount
    resetTimer();

    // Track user activity events
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup on unmount or when authentication changes
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, logout, navigate]);
}
