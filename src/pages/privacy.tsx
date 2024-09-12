import Head from "next/head";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Totally Rad Blog</title>
        <meta
          name="description"
          content="Privacy Policy for Totally Rad Blog"
        />
      </Head>
      <div className="container mx-auto max-w-2xl p-4">
        <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
        <section className="mb-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you
            create or modify your account, request services, contact customer
            support, or otherwise communicate with us.
          </p>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, to develop new ones, and to protect Totally Rad Blog
            and our users.
          </p>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-semibold">3. Sharing of Information</h2>
          <p>
            We do not share personal information with companies, organizations,
            or individuals outside of Totally Rad Blog except in the following
            cases: With your consent, for legal reasons, or to protect rights,
            property, or safety.
          </p>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-semibold">4. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or
            as needed to provide you services, comply with our legal
            obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-semibold">5. Changes to This Policy</h2>
          <p>
            We may change this privacy policy from time to time. We will post
            any privacy policy changes on this page and, if the changes are
            significant, we will provide a more prominent notice.
          </p>
        </section>
      </div>
    </>
  );
}
