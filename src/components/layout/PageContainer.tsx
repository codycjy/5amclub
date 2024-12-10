// components/layout/PageContainer.tsx
export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto w-full">{children}</div>
    </div>
  );
};
