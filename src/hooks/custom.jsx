import { useEffect } from "react";

export function useSingleStepNavigationLimit() {
  useEffect(() => {
    // Push the current state to lock the navigation history.
    window.history.pushState({ page: "lock" }, "", window.location.href);

<<<<<<< HEAD
    const handlePopState = () => {
=======
    const handlePopState = (event) => {
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
