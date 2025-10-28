

import { Suspense } from "react";

export default function BlogPage() {
  return (
    <section className="py-4 max-w-7xl mx-auto px-6">
      <div className="text-center mx-auto flex flex-col gap-4 justify-center items-center">
        <h2 className=" text-3xl font-semibold text-pretty md:text-4xl  lg:max-w-3xl lg:text-5xl">
          Welcome to the <span className="text-primary">Blog</span> 📖
        </h2>
        <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
          Discover the latest trends, tips, and best practices in modern web
          development. From UI components to design systems, stay updated with
          our expert insights.
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <RenderBlogPosts />
      </Suspense>
    </section>
  );
}

async function RenderBlogPosts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
    </div>
  );
}
