import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center h-[60vh]">
      <div className="flex flex-row items-center gap-8">
        <h1 className="text-6xl font-bold leading-tight flex items-center gap-4">
           🐌
        </h1>
        <Button asChild className="text-lg font-semibold px-8 py-4" variant="secondary">
          <a href="/sale">Sale</a>
        </Button>
      </div>
    </div>
  );
}
