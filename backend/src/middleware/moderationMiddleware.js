// backend/src/middleware/moderationMiddleware.js
const BACKEND_BLOCKED = [
  /ignore\s*(all\s*)?(previous|prior)\s*instructions/gi,
  /you\s*are\s*now\s*(a|an)\s*(different|evil|jailbreak)/gi,
  /pretend\s*(you\s*are|to\s*be)/gi,
  /\b(rape|child\s*porn|terrorism|bomb\s*making)\b/gi,
]

function moderationMiddleware(req, res, next) {
  const fieldsToCheck = [
    req.body?.questions,
    req.body?.jobDescription,
    req.body?.role,
    req.body?.constraints,
    req.body?.candidateName,
    req.body?.questionScores?.map(q => q.notes).join(' '),
  ].filter(Boolean).join(' ')

  if (!fieldsToCheck) return next()

  for (const pattern of BACKEND_BLOCKED) {
    pattern.lastIndex = 0
    if (pattern.test(fieldsToCheck)) {
      return res.status(400).json({
        error: 'inappropriate_content',
        message: 'Input contains inappropriate content.',
      })
    }
  }

  next()
}

module.exports = { moderationMiddleware }
