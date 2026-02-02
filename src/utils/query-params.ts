export const parseQueryParams = (searchParams: URLSearchParams): Record<string, any> => {
  const result: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Match keys like "filter[field]" or "filter[nested][deep]"
    const matches = key.match(/^([^\[]+)(.*)$/);

    if (!matches) return;

    const baseKey = matches[1];
    const brackets = matches[2];

    if (!brackets) {
      // Simple key without brackets
      result[baseKey] = value;
    } else {
      // Extract all nested keys from brackets: [field][nested] => ['field', 'nested']
      const nestedKeys = brackets.match(/\[([^\]]*)\]/g)?.map((b) => b.slice(1, -1)) || [];

      let current = result;
      current[baseKey] = current[baseKey] || {};
      current = current[baseKey];

      nestedKeys.forEach((nestedKey, index) => {
        if (index === nestedKeys.length - 1) {
          current[nestedKey] = value;
        } else {
          current[nestedKey] = current[nestedKey] || {};
          current = current[nestedKey];
        }
      });
    }
  });

  return result;
};
