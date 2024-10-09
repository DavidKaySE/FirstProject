import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4">
      <header className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Ditt Produkt vs Konkurrenten</h1>
        <p className="text-xl mb-8">Skapa fantastiska videos enkelt och snabbt</p>
        <Button size="lg">Kom igång nu</Button>
      </header>

      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Hur är vi annorlunda?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Automatisk zoom" 
            description="Välj delar av din video som ska zoomas in automatiskt"
          />
          <FeatureCard 
            title="Vertikal export" 
            description="Välj önskat bildformat. Alla animationer justeras direkt."
          />
          <FeatureCard 
            title="Generera transkript" 
            description="Klicka på 'Generera transkript' för att lägga till undertexter"
          />
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center">Professionellt utseende</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard 
            title="Jämn musrörelse" 
            description="Skakiga och snabba musrörelser omvandlas till mjuka och vackra glidningar"
          />
          <FeatureCard 
            title="Ändra markörstorlek" 
            description="Gör din video lättare att följa genom att ändra markörens storlek"
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  )
}
