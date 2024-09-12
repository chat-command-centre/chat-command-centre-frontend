import Head from "next/head";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Use - Totally Rad Blog</title>
        <meta name="description" content="Terms of Use for Totally Rad Blog" />
      </Head>
      <div className="container mx-auto max-w-2xl p-4">
        <h1 className="mb-6 text-4xl font-bold">Terms of Use</h1>
        <p className="mb-4 italic">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Totally Rad Blog, you agree to be bound by
            these Terms of Use and all applicable laws and regulations. If you
            don't agree with any part of these terms, please don't use our
            service.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">
            2. User Responsibilities
          </h2>
          <p>
            You are responsible for your use of the Service and for any content
            you post. Content must be accurate, lawful, and not infringe on any
            third party's rights. Be excellent to each other and party on,
            dudes!
          </p>
        </section>
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">
            3. Intellectual Property
          </h2>
          <p>
            The Service and its original content, features, and functionality
            are owned by Totally Rad Blog and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property or proprietary rights laws.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">4. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">
            5. Limitation of Liability
          </h2>
          <p>
            In no event shall Totally Rad Blog, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your access to or use of
            or inability to access or use the Service.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            always post the most current version on our site. By continuing to
            use the Service after changes become effective, you agree to be
            bound by the revised terms.
          </p>
        </section>
      </div>
    </>
  );
}
