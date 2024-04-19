import { Head } from "$fresh/runtime.ts";

export interface SetupProps {
  url: URL;
  action?: string;
  error?: {
    handle?: string;
    title?: string;
    description?: string;
    icon?: string;
    image?: string;
    password?: string;
  };
  defaultValues?: {
    handle?: string;
    title?: string;
    description?: string;
    icon?: string;
    image?: string;
  };
}

export default function Setup(
  { action, url, error, defaultValues }: SetupProps,
) {
  const defaultAction = "/";
  const act = action || defaultAction;
  const button = act === defaultAction ? "Set up" : "Update";
  return (
    <>
      <Head>
        <title>Setting up your blog</title>
      </Head>
      <div>
        <h2>Setting up your blog</h2>
        <form method="post" action={act}>
          <fieldset>
            <label for="handle">Fediverse handle</label>
            <input
              type="text"
              id="handle"
              name="handle"
              placeholder="your-handle"
              required={true}
              pattern="^[A-Za-z._\-]{3,20}$"
              title="Must be 3-20 characters long and contain only letters, periods, underscores, and hyphens"
              aria-invalid={error?.handle == null ? undefined : "true"}
              value={defaultValues?.handle}
            />
            <small>
              {error?.handle && (
                <>
                  <strong>{error.handle}</strong>
                  {" "}
                </>
              )}
              People will find or mention your blog using this handle.{" "}
              <strong>@{url.host}</strong> will be appended to it.
            </small>
          </fieldset>
          <fieldset>
            <label for="title">Blog title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="My blog"
              required={true}
              aria-invalid={error?.title == null ? undefined : "true"}
              value={defaultValues?.title}
            />
            <small>
              {error?.title && (
                <>
                  <strong>{error.title}</strong>
                  {" "}
                </>
              )}
              This will be also the display name of your fediverse profile.
            </small>
          </fieldset>
          <fieldset>
            <label for="description">Blog description</label>
            <textarea
              id="description"
              name="description"
              placeholder="A blog about&hellip;"
              required={true}
              aria-invalid={error?.description == null ? undefined : "true"}
              value={defaultValues?.description}
            />
            <small>
              {error?.description && (
                <>
                  <strong>{error.description}</strong>
                  {" "}
                </>
              )}
              This will be also the bio of your fediverse profile.
            </small>
          </fieldset>
          <fieldset>
            <label for="icon">Icon</label>
            <input
              type="text"
              id="icon"
              name="icon"
              placeholder="https://example.com/icon.png"
              required={true}
              aria-invalid={error?.title == null ? undefined : "true"}
              value={defaultValues?.icon}
            />
            <small>
              {error?.icon && (
                <>
                  <strong>{error.icon}</strong>
                  {" "}
                </>
              )}
              This will be the Profile image for the fediverse profile.
            </small>
          </fieldset>
          <fieldset>
            <label for="image">Image</label>
            <input
              type="text"
              id="image"
              name="image"
              placeholder="https://example.com/image.png"
              required={true}
              aria-invalid={error?.image == null ? undefined : "true"}
              value={defaultValues?.image}
            />
            <small>
              {error?.image && (
                <>
                  <strong>{error.image}</strong>
                  {" "}
                </>
              )}
              This will be the Header image for the fediverse profile.
            </small>
          </fieldset>
          <fieldset>
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required={true}
              aria-invalid={error?.password == null ? undefined : "true"}
            />
            <small>
              {error?.password && (
                <>
                  <strong>{error.password}</strong>
                  {" "}
                </>
              )}
              This will be used to authenticate you when you want to update your
              blog.
            </small>
          </fieldset>
          <button type="submit">{button}</button>
        </form>
      </div>
    </>
  );
}
