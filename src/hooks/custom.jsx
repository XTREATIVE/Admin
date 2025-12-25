import { useEffect } from "react";

export function useSingleStepNavigationLimit() {
  useEffect(() => {
    // Push the current state to lock the navigation history.
    window.history.pushState({ page: "lock" }, "", window.location.href);

    const handlePopState = () => {
      // If the new location is the login page (e.g., "/"), push state to avoid navigation.
      if (window.location.pathname === "/") {
        window.history.pushState({ page: "lock" }, "", window.location.href);
        return;
      }
      // For any other navigation attempt, always push state again to lock navigation.
      window.history.pushState({ page: "lock" }, "", window.location.href);
    };

    // Listen for all popstate events
    window.addEventListener("popstate", handlePopState);

    // Cleanup the event listener on unmount.
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
