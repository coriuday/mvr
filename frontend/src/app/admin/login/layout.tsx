// The login page bypasses the AdminShell layout by using a nested layout
// that overrides the parent admin layout for this route only.
// This renders WITHOUT the sidebar/header.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
