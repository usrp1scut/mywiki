const math = require('remark-math');
const katex = require('rehype-katex');

module.exports = {
  title: "Jacob's wiki",
  titleDelimiter: "|", // Defaults to `|`
  tagline: "",
  url: "https://xiebo.pro",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "https://xiebo.pro/img/cathole.png",
  //organizationName: "linyuxuanlin", // Usually your GitHub org/user name.
  //projectName: "Wiki_Docusaurus", // Usually your repo name.
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },
  themeConfig: {

    footer: {
      
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://xiebo.pro"> xiebo.pro </a> | <a href="https://beian.miit.gov.cn">粤ICP备2022055105号 </a> | Built with Docusaurus`,
    },
    prism: {
      theme: require('prism-react-renderer/themes/vsDark'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
      defaultLanguage: "shell",
      additionalLanguages: ["git","nginx","http","python","sql"],
    },
    

    //sidebarCollapsible: true, //默认折叠
    image: 'https://docusaurus.io/img/docusaurus.svg',

    
    colorModeToggle: {
      // "light" | "dark"
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,

      // Dark/light switch icon options
      switchConfig: {
        // Icon for the switch while in dark mode
        darkIcon: '🌙',
        lightIcon: '🌞',

        // CSS to apply to dark icon,
        // React inline style object
        // see https://reactjs.org/docs/dom-elements.html#style
        darkIconStyle: {
          marginLeft: "2px",
        },

        // Unicode icons such as '\u2600' will work
        // Unicode with 5 chars require brackets: '\u{1F602}'
        //lightIcon: '\u{1F602}',

        lightIconStyle: {
          marginLeft: "1px",
        },
      },
    },

    navbar: {
      title: "Jacob's wiki",
      hideOnScroll: false,
      //style: 'primary',

      logo: {
        alt: "My  Logo",
        src:
          "https://xiebo.pro/img/cathole.png",
      },

      items: [
        {
          to: "blog",
          label: "博客",
          position: "left",
        },

        {
          href: "mailto:me@xiebo.pro",
          label: "联系我",
          position: "right",
        },

      ],
    },
  }, 


  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarCollapsible: true, //默认折叠
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: "https://github.com/usrp1scut/mywiki/tree/main",
          // include: ['**/*.md', '**/*.mdx'],
          // exclude: [
          //   '**/_*.{js,jsx,ts,tsx,md,mdx}',
          //   '**/_*/**',
          //   '**/*.test.{js,jsx,ts,tsx}',
          //   '**/__tests__/**',
          // ],
          // remarkPlugins: [math],
          // rehypePlugins: [katex],
        },
        blog: {
          blogTitle: 'Jacob\'s blog!',
          blogDescription: 'A docusaurus powered blog!',
          blogSidebarCount: 8,
          blogSidebarTitle: "文章",
          postsPerPage: 8,
          showReadingTime: false,
          path: 'blog',
          blogSidebarTitle: 'Recent',
          //sidebarPath: require.resolve("./sidebars.js"),
          editUrl: 'https://github.com/usrp1scut/mywiki/tree/main',

        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
          
        },
      },
    ],
  ],
};
