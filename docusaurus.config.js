const math = require('remark-math');
const katex = require('rehype-katex');

module.exports = {
  title: "xiebo.pro",
  titleDelimiter: "🦖", // Defaults to `|`
  tagline: "",
  url: "https://xiebo.pro",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "https://docusaurus.io/img/docusaurus.svg",
  //organizationName: "linyuxuanlin", // Usually your GitHub org/user name.
  //projectName: "Wiki_Docusaurus", // Usually your repo name.
  themeConfig: {
/*
    footer: {
      
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    */

    //sidebarCollapsible: true, //默认折叠
    image: 'https://docusaurus.io/img/docusaurus.svg',
    algolia: {
      apiKey: "5c07d8bf9c9928c4453857f6cad0420e",
      indexName: "wiki-power",

      // Optional: see doc section bellow
      contextualSearch: true,

      // Optional: Algolia search parameters
      searchParameters: {},

      //... other Algolia params
    },


    
    
    colorMode: {
      // "light" | "dark"
      //defaultMode: "dark",
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

    hideableSidebar: false,
    navbar: {
      title: "xiebo.pro",
      hideOnScroll: false,
      //style: 'primary',
      /*
      logo: {
        alt: "My Site Logo",
        src:
          "https://wiki-media-1253965369.cos.ap-guangzhou.myqcloud.com/img/20201122195819.png",
      },
      */
      items: [
        {
          to: "blog",
          label: "博客",
          position: "right",
        },
        /*
        {
          href: "https://wiki.wildwolf.tech/",
          label: "队内知识库",
          position: "right",
        },
        */
        {
          href: "https://google.com/",
          label: "搜索",
          position: "right",
        },
        {
          href: "https://www.hao123.com/",
          label: "友链 & 导航站",
          position: "right",
        },
      ],
    },
  }, 

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/gh/linyuxuanlin/Wiki_Docusaurus/static/katex/v0.12.0/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X',
      crossorigin: 'anonymous',
    },
  ],

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarCollapsible: true, //默认折叠
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          editUrl: "https://127.0.0.1",
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          //blogTitle: 'Power\'s blog!',
          //blogDescription: 'A docusaurus powered blog!',
          blogSidebarCount: 8,
          postsPerPage: 8,
          showReadingTime: false,
          path: 'blog',
          blogSidebarTitle: 'Recent',
          //sidebarPath: require.resolve("./sidebars.js"),
          editUrl: 'https://127.0.0.1',
          /*
          feedOptions: {
            type: 'all', // required. 'rss' | 'feed' | 'all'
            title: 'Power\'s Blog', // default to siteConfig.title
            description: '个人博客', // default to  `${siteConfig.title} Blog`
            copyright: 'Copyright © ${new Date().getFullYear()} Power Lin',
            language: undefined, // possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
          },
          */
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
