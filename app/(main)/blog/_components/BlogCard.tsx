import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

import Image from "next/image";

interface BlogCardProps {
  post: {
    title: string;
    image: string;
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
    authorId: string;
  };
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="grid grid-rows-[auto_auto_1fr_auto] pt-0">
      <div className="aspect-16/9 w-full">
        <a
          href={`/blog/${post.id}`}
          target="_blank"
          className="transition-opacity duration-200 fade-in hover:opacity-70"
        >
          <Image
            src={post.image}
            alt={post.title}
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
          />
        </a>
      </div>
      <CardHeader>
        <h3 className="text-lg font-semibold hover:underline md:text-xl">
          <a href={`/blog/${post.id}`} target="_blank">
            {post.title}
          </a>
        </h3>
        <p className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(post.createdAt)}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
      </CardContent>
      <CardFooter>
        <a
          href={`/blog/${post.id}`}
          target="_blank"
          className="flex items-center text-foreground hover:underline"
        >
          Read more
          <ArrowRight className="ml-2 size-4" />
        </a>
      </CardFooter>
    </Card>
  );
}
