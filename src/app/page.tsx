export default function Home() {
  // In the Desktop OS Architecture, the home route '/' only renders the NexusHub background
  // and the Dock, which are managed by MainLayoutWrapper.
  // We return a hidden div instead of null to prevent Next.js rendering issues.
  return <div className="hidden" aria-hidden="true"></div>;
}
