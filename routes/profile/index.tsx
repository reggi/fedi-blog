import { Handlers, PageProps } from "$fresh/server.ts";
import Setup from "../../components/Setup.tsx";
import { federation } from "../../federation/mod.ts";
import { getBlog, setBlog } from "../../models/blog.ts";
import { getFollowersAsActors } from "../../models/follower.ts";
import { Person, Update } from "@fedify/fedify";
import { Image } from "@fedify/fedify";
import { HomeData, setup } from "../index.tsx";
import { extname } from "@std/path";
import { contentType } from "$fresh/src/server/deps.ts";

export const handler: Handlers<HomeData> = {
  async GET(_req, ctx) {
    const blog = await getBlog();
    if (blog == null) return await ctx.renderNotFound();
    return await ctx.render({
      defaultValues: {
        ...blog,
        icon: blog.icon.toString(),
        image: blog.image.toString(),
      },
    });
  },

  async POST(req, ctx) {
    const res = await setup(req, ctx);
    if (res) return res;

    const blog = await getBlog();
    if (blog == null) return await ctx.renderNotFound();

    // Gets a federation context for enqueueing an activity:
    const fedCtx = await federation.createContext(req);
    // Enqueues a `Create` activity to the outbox:

    const update = new Update({
      id: new URL(`/user/${blog.handle}`, req.url),
      actor: fedCtx.getActorUri(blog.handle),
      to: new URL("https://www.w3.org/ns/activitystreams#Public"),
      object: new Person({
        id: fedCtx.getActorUri(blog.handle),
        name: blog.title,
        summary: blog.description,
        icon: new Image({
          mediaType: contentType(extname(blog.icon.pathname)),
          url: blog.icon,
        }),
        image: new Image({
          mediaType: contentType(extname(blog.image.pathname)),
          url: blog.image,
        }),
      }),
    });

    await fedCtx.sendActivity(
      { handle: blog.handle },
      await getFollowersAsActors(),
      update,
    );

    return await ctx.render({
      defaultValues: {
        ...blog,
        icon: blog.icon.toString(),
        image: blog.image.toString(),
      },
    });
  },
};

export default function Profile(props: PageProps<HomeData>) {
  return (
    <Setup
      action="/profile"
      url={props.url}
      error={props.data?.error}
      defaultValues={props.data?.defaultValues}
    />
  );
}
