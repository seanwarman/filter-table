export const PuppeteerTargets = () => [
  {
    expect: true,
    category: 'SEO',
    priority: 'high',
    description: 'is the site indexed and visible for google to crawl',
    method: 'isSiteIndexed'
  },
  {
    expect: true,
    category: 'Security',
    priority: 'high',
    description: 'does the site have an SSL certificate',
    method: 'isSiteHttps'
  },
  {
    expect: true,
    category: 'Security',
    priority: 'high',
    description: 'does the http version redirect to https',
    method: 'doesSiteRedirectToHttps'
  },
  {
    expect: {
      taskDuration: {
        range: [4,12]
      },
      scriptDuration: {
        range: [1.4,1.8]
      },
      documents: {
        range: [5, 11]
      },
      unusedScriptsSize: {
        range: [36392608, 136392528]
      }
    },
    category: 'Performance',
    priority: 'high',
    description: 'load speed for desktop',
    method: 'pageLoadMetrics',
    input: {
      config: {
        width: 2560, 
        height: 1440, 
        isMobile: false
      },
    }
  },
  {
    expect: {
      taskDuration: {
        range: [4,12]
      },
      scriptDuration: {
        range: [1.4,1.8]
      },
      documents: {
        range: [5, 11]
      },
      unusedScriptsSize: {
        range: [36392608, 136392528]
      }
    },
    category: 'Performance',
    priority: 'high',
    description: 'load speed for mobile',
    method: 'pageLoadMetrics',
    input: {
      config: {
        width: 320, 
        height: 568, 
        isMobile: true  
      },
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'does the site have google analytics set up',
    method: 'checkNetworkForString',
    input: {
      term: 'google-analytics'
    }
  },
]


export const CheerioTargets = () => [ 
  // {
  //   description: 'get the raw text of the page',
  //   method: 'saveHtml',
  //   input: {
  //     type: 'html',
  //   },
  // },
  {
    category: 'SEO',
    priority: 'high',
    description: 'list all links to external webpages',
    method: 'getLinkHrefs',
  },
  {
    expect: {
      range: [0, 30]
    },
    category: 'SEO',
    priority: 'high',
    description: 'how many are there including all navigation links',
    method: 'checkNumberOfTags',
    input: {
      type: 'a',
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'should range between 10-70 chars',
    method: 'checkLengthOfTagContent',
    input: {
      type: 'title',
      range: [10, 70],
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'should range between 10-70 chars',
    method: 'checkLengthOfTagContent',
    input: {
      type: 'h1',
      range: [10, 70],
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'should only be one on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h1',
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'must be full articulate sentences and not include random words.',
    method: 'checkGrammar',
    input: {
      type: 'meta[name="description"]',
      attr: 'content',
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'should range between 150-165 chars',
    method: 'checkLengthOfTagContentByAttr',
    input: {
      range: [150, 165],
      type: 'meta[name="description"]',
      attr: 'content',
    }
  },
  {
    expect: 1,
    category: 'SEO',
    priority: 'med',
    description: 'how many of each are there on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h1',
    }
  },
  {
    expect: 1,
    category: 'SEO',
    priority: 'med',
    description: 'how many of each are there on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h2',
    }
  },
  {
    expect: 1,
    category: 'SEO',
    priority: 'med',
    description: 'how many of each are there on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h3',
    }
  },
  {
    expect: 1,
    category: 'SEO',
    priority: 'med',
    description: 'how many of each are there on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h4',
    }
  },
  {
    expect: 1,
    category: 'SEO',
    priority: 'med',
    description: 'how many of each are there on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h5',
    }
  },
  {
    expect: 1,
    category: 'SEO',
    priority: 'med',
    description: 'how many of each are there on the page',
    method: 'checkNumberOfTags',
    input: {
      type: 'h6',
    }
  },
  {
    expect: {
      integrators: { range: [ 0,2 ] },
      spam: { range: [ 0,2 ] },
      viruses: { range: [ 0,2 ] }
    },
    category: 'SEO',
    priority: 'med',
    description: 'how many target keywords are there in the page',
    method: 'checkForTargetKeywords',
    input: {
      type: 'body',
      keywords: [
        'integrators',
        'spam',
        'viruses'
      ],
    }
  },
  {
    expect: true,
    category: 'SEO',
    priority: 'med',
    description: 'is the content under 500 words',
    method: 'checkLengthOfTagContent',
    input: {
      type: 'p',
      range: [0, 500],
    }
  },
  {
    expect: { range: [ -1000, 0 ] },
    category: 'SEO',
    priority: 'low',
    description: 'how many imgs have missing ALT tags',
    method: 'checkLengthOfMissingAttr',
    input: {
      type: 'img',
      attr: 'alt',
    }
  },
  {
    expect: {
      integrators: { range: [ 0,2 ] },
      spam: { range: [ 0,2 ] },
      viruses: { range: [ 0,2 ] }
    },
    category: 'SEO',
    priority: 'low',
    description: 'how many meta keywords are there',
    method: 'checkForTargetKeywordsInAttr',
    input: {
      type: 'meta',
      attr: 'content',
      keywords: [
        'integrators',
        'spam',
        'viruses'
      ],
    }
  }
]
