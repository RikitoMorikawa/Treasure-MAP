export default function TravelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-br from-sky-300 via-blue-100 to-indigo-200"
      />
      {children}
    </>
  );
}
