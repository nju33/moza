export function formatMatter<
  C extends {data: {[prop: string]: object | string}}
>(ctx: C): C {
  Object.keys(ctx.data).forEach(item => {
    const target = ctx.data[item];
    if (typeof target !== 'object' || target === null) {
      ctx.data[item] = {default: target};
    }
  });
  return ctx;
}
