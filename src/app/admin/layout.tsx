import { ReactNode } from 'react'

export default function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <main>{children}</main>
        </div>
    )
}
