import env from "@/env";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <span className="loading loading-spinner loading-md mx-auto block" />
  ),
});

export default function DocumentationPage() {
  return (
    <>
      <Head>
        <title>Dansdata API Documentation</title>
        <meta
          name="description"
          content="API documentation site for the Dansdata dance information project. Dansdata - in the swing with Swedish dance!"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
        <meta
          name="robots"
          content="noindex"
        />
      </Head>
      <div className="flex min-h-full flex-col">
        <header></header>
        <main className="grow px-4 py-8">
          {/* Swagger does not support dark mode */}
          <div
            data-theme="light"
            className="mockup-window border border-outline shadow-md"
          >
            <div className="px-4 pb-4">
              <SwaggerUI url="/api/v1/dansdata.api.json" />
            </div>
          </div>
        </main>
        <footer className="footer items-center bg-neutral p-10 text-neutral-content">
          <div>
            <span className="footer-title">Dansdata</span>
            <a
              href="https://dansdata.se"
              target="_blank"
              className="link-hover link"
            >
              Homepage
            </a>
            <a
              href="https://portal.dansdata.se"
              target="_blank"
              className="link-hover link"
            >
              Portal
            </a>
          </div>
          <div>
            <span className="footer-title">Development</span>
            <a
              href="https://www.facebook.com/DansdataSE"
              target="_blank"
              className="link-hover link"
            >
              Facebook
            </a>
            <a
              href="https://github.com/dansdata-se"
              target="_blank"
              className="link-hover link"
            >
              GitHub
            </a>
          </div>
          <div>
            <span className="footer-title">Legal</span>
            {/* TODO(FelixZY): Add hrefs once legal pages are in place. */}
            <a
              className="link-hover link"
              target="_blank"
            >
              Terms of Service
            </a>
            <a
              target="_blank"
              className="link-hover link"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
        <footer className="footer border-t border-outline bg-neutral px-10 py-4 text-neutral-content">
          <div className="grid-flow-col items-center">
            <div className="grid grid-flow-col items-center gap-4">
              <Image
                className="rounded-md"
                src="/images/logo.png"
                alt="Dansdata logo"
                height={50}
                width={50}
              />
              <p>
                <span className="font-brand text-xl text-primary">
                  Dansdata
                </span>
                <br />
                <span className="italic">In the swing with Swedish dance!</span>
              </p>
            </div>
          </div>
          <div className="md:place-self-center md:justify-self-end">
            <a
              href={`https://github.com/dansdata-se/api/tree/${env.VERCEL_GIT_COMMIT_SHA}`}
              target="_blank"
              className="link-hover link text-xs"
            >
              {env.VERCEL_GIT_COMMIT_REF}:
              {env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)}
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
