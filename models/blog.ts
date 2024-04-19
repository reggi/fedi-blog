/// <reference lib="deno.unstable" />
import { Temporal } from "@js-temporal/polyfill";
import {
  exportJwk,
  generateCryptoKeyPair,
  importJwk,
} from "@fedify/fedify/httpsig";
import { hash, verify } from "scrypt";
import { openKv } from "./kv.ts";

interface BlogBase {
  handle: string;
  title: string;
  description: string;
}

export interface BlogInput extends BlogBase {
  password?: string;
  icon: string;
  image: string;
}

export interface Blog extends BlogBase {
  passwordHash: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  published: Temporal.Instant;
  icon: URL;
  image: URL;
}

export async function setBlog(blog: BlogInput): Promise<void> {
  const kv = await openKv();
  const { privateKey, publicKey } = await generateCryptoKeyPair();
  await kv.set(["blog"], {
    handle: blog.handle,
    title: blog.title,
    description: blog.description,
    published: new Date().toISOString(),
    ...(blog.password
      ? { passwordHash: hash(blog.password, undefined, "scrypt") }
      : {}),
    privateKey: await exportJwk(privateKey),
    publicKey: await exportJwk(publicKey),
    icon: blog.icon,
    image: blog.image,
  });
}

export interface BlogInternal extends BlogBase {
  icon: string;
  image: string;
  passwordHash: string;
  privateKey: Record<string, unknown>;
  publicKey: Record<string, unknown>;
  published: string;
}

export async function getBlog(): Promise<Blog | null> {
  const kv = await openKv();
  const entry = await kv.get<BlogInternal>(["blog"]);
  if (entry == null || entry.value == null) return null;

  return {
    ...entry.value,
    image: new URL(entry.value.image),
    icon: new URL(entry.value.icon),
    privateKey: await importJwk(entry.value.privateKey, "private"),
    publicKey: await importJwk(entry.value.publicKey, "public"),
    published: Temporal.Instant.from(entry.value.published),
  };
}

export function verifyPassword(blog: Blog, password: string): boolean;
export function verifyPassword(password: string): Promise<boolean>;
export function verifyPassword(
  blogOrPassword: Blog | string,
  password?: string,
): Promise<boolean> | boolean {
  if (typeof blogOrPassword === "string") {
    return getBlog().then((blog) => {
      if (blog == null) return false;
      return verifyPassword(blog, blogOrPassword);
    });
  }
  return verify(password!, blogOrPassword.passwordHash, "scrypt");
}
