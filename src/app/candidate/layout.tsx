export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="flex-1">{children}</main>
    )
}
