import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import PostList from "../components/PostList.tsx";
import Setup from "../components/Setup.tsx";
import { BlogInput } from "../models/blog.ts";
import { getBlog, setBlog } from "../models/blog.ts";
import { countFollowers } from "../models/follower.ts";
import { countPosts, getPosts } from "../models/post.ts";
import { verifyPasswordForm } from "./posts/index.tsx";

export interface HomeData {
  error?: {
    handle?: string;
    title?: string;
    description?: string;
    password?: string;
    icon?: string;
    image?: string;
  };
  defaultValues?: {
    handle?: string;
    title?: string;
    description?: string;
    icon?: string;
    image?: string;
  };
}

function validUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export async function setup(
  req: Request,
  ctx: FreshContext<Record<string, unknown>, HomeData, HomeData>,
) {
  const blog = await getBlog();

  const form = await req.formData();
  const handle = form.get("handle");
  const title = form.get("title");
  const description = form.get("description");
  const password = form.get("password");
  const icon = form.get("icon");
  const image = form.get("image");

  const error: HomeData["error"] = {};

  if (blog) {
    verifyPasswordForm(error, form, blog);
  }
  if (icon == null || typeof icon !== "string" || !validUrl(icon)) {
    error.icon = "Icon must be a url.";
  }
  if (image == null || typeof image !== "string" || !validUrl(image)) {
    error.image = "Image must be a url.";
  }
  if (handle == null || typeof handle !== "string" || handle.trim() === "") {
    error.handle = "Handle is required.";
  } else if (!handle.match(/^[A-Za-z._-]{3,20}$/)) {
    error.handle =
      "Handle must be 3-20 characters long and contain only letters, periods, underscores, and hyphens.";
  }
  if (title == null || typeof title !== "string" || title.trim() === "") {
    error.title = "Title is required.";
  }
  if (
    description == null || typeof description !== "string" ||
    description.trim() === ""
  ) {
    error.description = "Description is required.";
  }
  if (
    password == null || typeof password != "string" || password.trim() === ""
  ) {
    error.password = "Password is required.";
  }
  if (error.handle || error.title || error.description || error.password) {
    return await ctx.render({
      error,
      defaultValues: {
        handle: handle?.toString(),
        title: title?.toString(),
        description: description?.toString(),
        icon: icon?.toString(),
        image: image?.toString(),
      },
    }, { status: 400 });
  }

  const blogInput: BlogInput = {
    handle: handle?.toString()!,
    title: title?.toString()!,
    description: description?.toString()!,
    icon: icon?.toString()!,
    image: image?.toString()!,
    password: password?.toString()!,
  };

  await setBlog(blogInput);
}

export const handler: Handlers<HomeData> = {
  async GET(_req, ctx) {
    return await ctx.render();
  },

  async POST(req, ctx) {
    const res = await setup(req, ctx);
    if (res) return res;
    return await ctx.render({}, { status: 201 });
  },
};

export default async function Home(_req: Request, props: PageProps<HomeData>) {
  const blog = await getBlog();
  const { posts, nextCursor } = await getPosts();
  const total = await countPosts();
  const followers = await countFollowers();
  return blog == null
    ? (
      <Setup
        url={props.url}
        error={props.data?.error}
        defaultValues={props.data?.defaultValues}
      />
    )
    : (
      <PostList
        blog={blog}
        posts={posts}
        total={total}
        followers={followers}
        nextCursor={nextCursor}
        domain={props.url.host}
      />
    );
}
