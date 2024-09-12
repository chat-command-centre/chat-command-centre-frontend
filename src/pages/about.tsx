import Head from "next/head";
import Link from "next/link";

export default function About() {
  return (
    <>
      <Head>
        <title>About - Totally Rad Blog</title>
        <meta name="description" content="Learn about Totally Rad Blog" />
      </Head>
      <div className="container mx-auto max-w-2xl p-4">
        <h1 className="mb-6 text-4xl font-bold">About Totally Rad Blog</h1>
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold">Our Mission</h2>
          <p className="mb-4">
            Totally Rad Blog is a platform for sharing awesome content and
            connecting with like-minded individuals. Our mission is to provide a
            space where users can express themselves freely and engage in
            meaningful discussions about all things rad.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold">What Makes Us Rad</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>User-generated content that's totally tubular</li>
            <li>A gnarly voting system to boost the coolest posts</li>
            <li>Bodacious tipping feature to support your favorite authors</li>
            <li>Wicked cool customization options for your profile</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold">
            Join the Rad Community
          </h2>
          <p className="mb-4">
            Ready to dive into the radical world of Totally Rad Blog? Sign up
            today and start sharing your awesome ideas with the world!
          </p>
          <Link
            href="/signup"
            className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Sign Up Now
          </Link>
        </section>
      </div>
    </>
  );
}
