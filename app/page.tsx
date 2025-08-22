import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const features = [
    {
      icon: <Icons.fileText className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Coverage',
      description: 'Get detailed script analysis with industry-standard coverage in minutes.',
    },
    {
      icon: <Icons.fileEdit className="h-8 w-8 text-primary" />,
      title: 'Development Notes',
      description: 'Receive actionable feedback to improve your script with structured development notes.',
    },
    {
      icon: <Icons.fileBarChart2 className="h-8 w-8 text-primary" />,
      title: 'Market Insights',
      description: 'Understand how your script compares to industry standards and market trends.',
    },
    {
      icon: <Icons.fileClock className="h-8 w-8 text-primary" />,
      title: 'Fast Turnaround',
      description: 'Get your script analyzed in minutes, not weeks like traditional coverage services.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col
    ">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Elevate Your Screenplay with
            <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI-Powered Analysis
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Get professional-quality script coverage and development notes in minutes, not weeks.
            Perfect for screenwriters, producers, and filmmakers at any stage of development.
          </p>
          <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-6 sm:space-y-0">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold">
              Get Started - It's Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Professional Script Analysis at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ScriptGenius combines the expertise of industry professionals with cutting-edge AI to
              provide you with comprehensive script analysis.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Improve Your Script?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of writers who trust ScriptGenius for professional script analysis.
            </p>
            <div className="mt-8">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center space-x-2">
              <Icons.fileText className="h-6 w-6" />
              <span className="text-lg font-bold">ScriptGenius</span>
            </div>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ScriptGenius. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
