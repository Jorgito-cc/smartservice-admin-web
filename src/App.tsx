import { AuthProvider } from "./context/AuthContext";
import { AppRouter } from "./presentation/router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
