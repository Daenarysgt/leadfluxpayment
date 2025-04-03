
import { useStore } from "@/utils/store";
import StepsSidebar from "./sidebar/StepsSidebar";

// This is just a wrapper to maintain backward compatibility
const StepsSidebarWrapper = () => {
  return <StepsSidebar />;
};

export default StepsSidebarWrapper;
