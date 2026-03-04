import { Toaster } from "./components/ui/sonner";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <AppRoutes />
    </>
  );
}
