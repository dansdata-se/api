import Head from "next/head";
import Image from "next/image";
import SwaggerUI from "swagger-ui-react";

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
      <div className="min-h-full flex flex-col">
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
        <footer className="footer bg-neutral text-neutral-content p-10 items-center">
          <div>
            <span className="footer-title">Dansdata</span>
            <a
              href="https://dansdata.se"
              target="_blank"
              className="link link-hover"
            >
              Homepage
            </a>
            <a
              href="https://portal.dansdata.se"
              target="_blank"
              className="link link-hover"
            >
              Portal
            </a>
          </div>
          <div>
            <span className="footer-title">Development</span>
            <a
              href="https://www.facebook.com/DansdataSE"
              target="_blank"
              className="link link-hover"
            >
              Facebook
            </a>
            <a
              href="https://github.com/dansdata-se"
              target="_blank"
              className="link link-hover"
            >
              GitHub
            </a>
          </div>
          <div>
            <span className="footer-title">Legal</span>
            {/* TODO(FelixZY): Add hrefs once legal pages are in place. */}
            <a
              className="link link-hover"
              target="_blank"
            >
              Terms of Service
            </a>
            <a
              target="_blank"
              className="link link-hover"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
        <footer className="footer bg-neutral text-neutral-content px-10 py-4 border-t border-outline">
          <div className="items-center grid-flow-col">
            <div className="grid grid-flow-col gap-4 items-center">
              <Image
                className="rounded-md"
                src="/images/logo.png"
                alt="Dansdata logo"
                height={50}
                width={50}
              />
              <p>
                <span className="text-xl text-primary font-brand">
                  Dansdata
                </span>
                <br />
                <span className="italic">In the swing with Swedish dance!</span>
              </p>
            </div>
          </div>
          <div className="md:place-self-center md:justify-self-end">
            <a
              href={`https://github.com/dansdata-se/api/tree/${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`}
              target="_blank"
              className="link link-hover text-xs"
            >
              {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}:
              {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.substring(0, 7)}
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
