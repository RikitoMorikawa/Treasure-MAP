export default function ClimbsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-300 via-green-100 to-teal-200"
      />
      {children}
    </>
  );
}
