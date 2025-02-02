import { startNotificationService, stopNotificationService } from './services/notification';

function App() {
  useEffect(() => {
    // Mulai service ketika komponen dimount
    startNotificationService();

    // Cleanup ketika komponen unmount
    return () => {
      stopNotificationService();
    };
  }, []);

  return (
    // ... kode komponen Anda
  );
}

export default App; 