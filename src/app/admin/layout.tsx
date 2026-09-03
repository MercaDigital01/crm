// Thin shared shell for everything under /admin — both the guarded
// (dashboard) route group and the unguarded sign-in page nest under this.
// Exists only to apply .admin-panel (see globals.css) consistently, so form
// controls/focus states/table hovers stay uniform across every admin screen
// without repeating classes per page.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel flex flex-1 flex-col font-admin-sans text-white">
      {children}
    </div>
  );
}
