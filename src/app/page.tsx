export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            SpotCove Frontend
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Public demo and vendor storefronts
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 mt-12">
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">Demo Routes</h2>
              <p className="text-muted-foreground mb-4">
                View pre-built demo layouts and themes
              </p>
              <div className="space-y-2">
                <a href="/demo/minimal" className="block text-primary hover:underline">
                  /demo/minimal
                </a>
                <a href="/demo/fashion" className="block text-primary hover:underline">
                  /demo/fashion
                </a>
                <a href="/demo/marketplace" className="block text-primary hover:underline">
                  /demo/marketplace
                </a>
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">Vendor Routes</h2>
              <p className="text-muted-foreground mb-4">
                View vendor-specific storefronts
              </p>
              <div className="space-y-2">
                <a href="/vendor/electronics/minimal" className="block text-primary hover:underline">
                  /vendor/electronics/minimal
                </a>
                <a href="/vendor/fashion/fashion" className="block text-primary hover:underline">
                  /vendor/fashion/fashion
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
