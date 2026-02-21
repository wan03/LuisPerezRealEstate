import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                © 2026 Luis Perez Real Estate • Powered by Command Center
            </footer>
        </div>
    );
}
