declare module 'gray-matter' {
  function matter(
    content: string,
  ): {content: string; excerpt: string; data: {[flag: string]: any}};

  export = matter;
}
