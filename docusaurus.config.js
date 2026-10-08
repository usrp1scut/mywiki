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
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  favicon: "img/favicon.svg",
  //organizationName: "linyuxuanlin", // Usually your GitHub org/user name.
  //projectName: "Wiki_Docusaurus", // Usually your repo name.
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN"],
  },
  themes: [
    '@docusaurus/theme-mermaid',
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
    // announcementBar: {
    //   id: 'relax',
    //   content:
    //     '欲买桂花同载酒，终不似，少年游。',
    //   backgroundColor: '#1fa588',
    //   textColor: '#000',
    //   isCloseable: true,
    // },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },

    footer: {      
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://xiebo.fun"> xiebo.fun </a> | <a href="https://beian.miit.gov.cn">粤ICP备2024327945号 </a> | Built with Docusaurus`,
    },
    
    prism: {
      theme: {
        ...prismThemes.github,
        plain: {color: '#30433e', backgroundColor: 'var(--surface-code)'},
        styles: [
          ...prismThemes.github.styles,
          {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#61786f', fontStyle: 'normal'}},
          {types: ['string', 'attr-value'], style: {color: '#806247'}},
          {types: ['number', 'boolean', 'variable', 'constant', 'property', 'symbol', 'regex', 'inserted'], style: {color: '#326c70'}},
          {types: ['keyword', 'atrule', 'attr-name', 'selector'], style: {color: '#326c70'}},
        ],
      },
      darkTheme: {
        ...prismThemes.vsDark,
        plain: {color: '#d0e7e1', backgroundColor: 'var(--surface-code)'},
        styles: [
          ...prismThemes.vsDark.styles,
          {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#9ebeb7'}},
          {types: ['constant', 'string', 'attr-value'], style: {color: '#d8c28c'}},
          {types: ['variable', 'attr-name'], style: {color: '#b3dfd3'}},
          {types: ['keyword', 'builtin', 'changed'], style: {color: '#71deb7'}},
        ],
      },
      defaultLanguage: "bash",
      additionalLanguages: ['git','nginx','python','sql','yaml','go','powershell','batch','bash'],
    },
    

    //sidebarCollapsible: true, //默认折叠
    image: 'img/logo.png',

    
    colorMode: {
      // "light" | "dark"
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,

      // Dark/light switch icon options
    },

    navbar: {
      title: "Jacob's wiki",
      hideOnScroll: false,
      //style: 'primary',

      logo: {
        alt: "Jacob 折页 J",
        src: "img/wiki-mark.svg",
        srcDark: "img/wiki-mark-dark.svg",
        width: 32,
        height: 32,
      },

      items: [
        {
          to: "docs",
          label: "知识库",
          position: "left",
        },
        {
          to: "/news",
          label: "资讯",
          position: "left",
        },
        {
          type: "dropdown",
          label: "性格测试",
          position: "left",
          items: [
            {
              to: "/sbti",
              label: "SBTI 测试",
            },
            {
              to: "/mbti",
              label: "MBTI 测试",
            },
          ],
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
  plugins: [
    require.resolve('./plugins/recent-blog-posts'),
    require.resolve('./plugins/blog-thumbnails'),
  ],
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
          blogTitle: '博客',
          blogDescription: '技术实践、开源周报与日常随笔。',
          blogSidebarCount: 8,
          blogSidebarTitle: "最近文章",
          postsPerPage: 8,
          showReadingTime: false,
          path: 'blog',
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
