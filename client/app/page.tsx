// import Button from "@/app/_components/Button";
import Button from "@/app/_brutalComponents/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-8 font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <header className="mb-16 border-4 border-black bg-yellow-400 p-8 shadow-[8px_8px_0_0_#000]">
        <h1 className="mb-4 text-5xl font-bold">Chat with AI Minds</h1>
        <p className="text-xl mb-8">
          Pay-as-you-go access to cutting-edge LLMs
        </p>

        <Link href="/login">
          <Button buttonText="Get Started" buttonType="secondary" />
        </Link>
      </header>

      {/* Pricing Cards */}
      <section className="grid gap-8 mb-16 md:grid-cols-3">
        <div className="border-4 border-black bg-green-400 p-6 shadow-[8px_8px_0_0_#000]">
          <h3 className="text-2xl font-bold mb-4">Starter Pack</h3>
          <div className="text-4xl font-bold mb-4">$5</div>
          <p className="mb-4">500 Tokens</p>
          <Button buttonText="Get Started" buttonType="primary" size="full" />
        </div>

        <div className="border-4 border-black bg-blue-400 p-6 shadow-[8px_8px_0_0_#000] relative">
          <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 -translate-y-2 translate-x-2">
            POPULAR
          </div>
          <h3 className="text-2xl font-bold mb-4">Pro Pack</h3>
          <div className="text-4xl font-bold mb-4">$20</div>
          <p className="mb-4">2500 Tokens</p>
          <button className="w-full border-4 border-black bg-black text-white py-2 font-bold hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#000] transition-all">
            Get Started
          </button>
        </div>

        <div className="border-4 border-black bg-purple-400 p-6 shadow-[8px_8px_0_0_#000]">
          <h3 className="text-2xl font-bold mb-4">Mega Pack</h3>
          <div className="text-4xl font-bold mb-4">$50</div>
          <p className="mb-4">7000 Tokens</p>
          <button className="w-full border-4 border-black bg-white py-2 font-bold hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#000] transition-all">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-4 border-black bg-orange-400 p-8 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="border-4 border-black bg-white p-4">
            <h3 className="text-xl font-bold mb-2">Pay As You Go</h3>
            <p>Only pay for what you use with our flexible token system</p>
          </div>
          <div className="border-4 border-black bg-white p-4">
            <h3 className="text-xl font-bold mb-2">Multi-LLM Access</h3>
            <p>Chat with various AI models through a single platform</p>
          </div>
          <div className="border-4 border-black bg-white p-4">
            <h3 className="text-xl font-bold mb-2">Instant Recharge</h3>
            <p>Top up your tokens anytime with one-click payments</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center border-4 border-black bg-pink-400 p-4 shadow-[4px_4px_0_0_#000]">
        <p>© 2024 AI Chat Platform. All thinking reserved.</p>
      </footer>
    </div>
  );
}
