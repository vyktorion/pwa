import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Left side - Content */}
        <div className="flex-1 ">
          <h1 className="text-6xl font-bold leading-tight">
            Welcome to this <span className="text-primary">SLOW</span> website
            🐌
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl text-balance mt-2">
            This is a slow website that is designed to be slow. But don&apos;t
            worry, we will make it faster 🚀
          </p>
          <div className="flex justify-start mt-10">
            <Button className="text-xl font-bold px-10 py-6" variant="default">
              <span className="mr-3"><i className="fa fa-rocket" /></span>
              Get Started
            </Button>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="flex-1">
          <Image
            src="/E_vbZ10XIAEi752.jpg"
            alt="Slow Image"
            width={500}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
