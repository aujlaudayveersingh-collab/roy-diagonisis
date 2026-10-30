// Admin area layout — metadata only. Each admin page renders AdminShell so the
// login page can stay standalone.
export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
