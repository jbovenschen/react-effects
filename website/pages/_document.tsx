import React from "react";
import NextDocument, {
  Html,
  Head,
  Main,
  DocumentContext,
  NextScript,
} from "next/document";

import { css } from "../stitches.config";

export default class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    try {
      let extractedStyles: string[] | undefined;
      ctx.renderPage = () => {
        const { styles, result } = css.getStyles(originalRenderPage);
        extractedStyles = styles;
        return result;
      };

      const initialProps = await NextDocument.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}

            {extractedStyles?.map((content, index) => (
              <style
                key={index}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ))}
          </>
        ),
      };
    } finally {
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@600&family=Quicksand:wght@400;500;700&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
