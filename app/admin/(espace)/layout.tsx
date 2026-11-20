import { exigerAdminPage } from '@/lib/auth';
import { MenuAdmin } from '@/components/admin/MenuAdmin';

export const dynamic = 'force-dynamic';

export default async function EspaceAdmin({ children }: { children: React.ReactNode }) {
  const { user } = await exigerAdminPage();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[264px_1fr]">
      <MenuAdmin email={user.email ?? ''} />
      <main id="contenu" className="min-w-0 px-5 pt-6 pb-16 sm:px-8 lg:px-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
