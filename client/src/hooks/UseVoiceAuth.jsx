import { useEffect, useState, useCallback } from "react"

const STORAGE_KEY = "__voice_auth_enrollment__"

function loadEnrollment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { name: "" }
  } catch {
    return { name: "" }
  }
}

function saveEnrollment(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useVoiceAuth() {
  const [enrolledName, setEnrolledName] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const data = loadEnrollment()
    setEnrolledName(data.name || "")
    // Always require fresh verification on each page load
    setIsVerified(false)
  }, [])

  const enroll = useCallback((name) => {
    const clean = String(name || "").trim()
    if (!clean) return false
    saveEnrollment({ name: clean })
    setEnrolledName(clean)
    setIsVerified(false)
    return true
  }, [])

  const verifyFromCommand = useCallback((spokenText) => {
    const name = (enrolledName || "").toLowerCase()
    if (!name) return false
    const text = String(spokenText || "").toLowerCase()
    // Simple passphrase check: must include the enrolled name once per session to unlock
    const ok = text.includes(name)
    if (ok) {
      setIsVerified(true)
    }
    return ok
  }, [enrolledName])

  const resetVerification = useCallback(() => {
    setIsVerified(false)
  }, [])

  return {
    enrolledName,
    isVerified,
    enroll,
    verifyFromCommand,
    resetVerification,
    markVerified: (ok) => setIsVerified(Boolean(ok)),
    lock: () => {
      setIsVerified(false)
    },
  }
}


