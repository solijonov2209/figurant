import AppRouter from "./app/router";
import { AuthProvider } from './app/provider/AuthProvider'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}


