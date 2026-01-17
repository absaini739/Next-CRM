'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import CallModal from '../voip/CallModal';

export default function DashboardLayout({
    children,
    noPadding = false,
}: {
    children: React.ReactNode;
    noPadding?: boolean;
}) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 relative">
                <Header />

                <main className={`absolute inset-x-0 bottom-0 top-16 ${noPadding ? 'overflow-hidden' : 'p-8 overflow-y-auto'}`}>
                    {children}
                </main>
            </div>
            <CallModal />
        </div>
    );
}
