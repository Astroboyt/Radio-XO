import LibraryView from '@/components/LibraryView';
import { GlobalPlayer } from '@/components/GlobalPlayer';
import { AuthGate } from '@/components/AuthGate';

export default function Home() {
  return (
    <AuthGate>
      <main>
        <LibraryView />
        <GlobalPlayer />
      </main>
    </AuthGate>
  );
}
