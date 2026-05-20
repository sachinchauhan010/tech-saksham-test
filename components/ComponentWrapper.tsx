export default function ComponentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased w-full max-w-7xl xl:max-w-8xl mx-auto">
      {children}
    </div>
  )
}
