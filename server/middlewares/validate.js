export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ message: "Validation failed", issues: err.errors ?? String(err) });
  }
};
