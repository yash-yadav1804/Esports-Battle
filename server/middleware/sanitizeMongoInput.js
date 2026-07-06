const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (!isObject(value)) {
    return value;
  }

  const sanitizedObject = {};

  Object.keys(value).forEach((key) => {
    const isUnsafeMongoKey = key.startsWith("$") || key.includes(".");

    if (!isUnsafeMongoKey) {
      sanitizedObject[key] = sanitizeValue(value[key]);
    }
  });

  return sanitizedObject;
};

const sanitizeMongoInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  if (req.query) {
    const sanitizedQuery = sanitizeValue(req.query);

    Object.defineProperty(req, "query", {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
    });
  }

  next();
};

module.exports = sanitizeMongoInput;
