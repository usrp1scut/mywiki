import {themes as prismThemes} from 'prism-react-renderer';
const math = require('remark-math');
const katex = require('rehype-katex');

module.exports = {
  title: "Jacob's wiki",
  titleDelimiter: "|", // Defaults to `|`
  tagline: '',
  url: "https://xiebo.fun",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logo.png",
  //organizationName: "linyuxuanlin", // Usually your GitHub org/user name.
  //projectName: "Wiki_Docusaurus", // Usually your repo name.
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN"],
  },
  themes: [
    // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        language: ["en", "zh"],
        // ```
      },
    ],
  ],

  themeConfig: {
    announcementBar: {
      id: 'relax',
      content:
        '欲买桂花同载酒，终不似，少年游。',
      backgroundColor: '#1fa588',
      textColor: '#000',
      isCloseable: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },

    footer: {
      
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://xiebo.fun"> xiebo.fun </a> | <a href="https://beian.miit.gov.cn">粤ICP备2024327945号 </a> | Built with Docusaurus`,
    },
    
    prism: {
      theme: prismThemes.jettwaveLight,
      darkTheme: prismThemes.dracula,
      defaultLanguage: "shell",
      additionalLanguages: ['git','nginx','python','sql','yaml','go'],
    },
    

    //sidebarCollapsible: true, //默认折叠
    image: 'img/logo.png',

    
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
        alt: "Jacob",
        src:
          "img/logo.png",
      },

      items: [
        {
          to: "docs",
          label: "知识库",
          position: "left",
        },
        {
          to: "blog",
          label: "博客",
          position: "right",
        },

        {
          href: "mailto:jacob@xiebo.fun",
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
          //breadcrumbs: false,
          //routeBasePath: "/",
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
          remarkPlugins: [math],
          rehypePlugins: [katex],
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
